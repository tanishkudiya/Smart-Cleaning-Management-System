// 'use client';
// import { useState, useCallback, useEffect } from 'react';
// import { MapPin, Upload, CheckCircle, Loader } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { GoogleGenerativeAI } from '@google/generative-ai';
// import { StandaloneSearchBox, useJsApiLoader } from '@react-google-maps/api';
// import { createUser, getUserByEmail, createReport, getRecentReports } from '@/utils/db/actions';
// import { useRouter } from 'next/navigation';
// import { toast } from 'react-hot-toast';

// const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
// const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// const libraries = ['places'];

// export default function ReportPage() {
//   const [user, setUser] = useState(null);
//   const router = useRouter();

//   const [reports, setReports] = useState([]);

//   const [newReport, setNewReport] = useState({
//     location: '',
//     type: '',
//     amount: '',
//   });

//   const [file, setFile] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [verificationStatus, setVerificationStatus] = useState('idle');
//   const [verificationResult, setVerificationResult] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const [searchBox, setSearchBox] = useState(null);

//   const { isLoaded } = useJsApiLoader({
//     id: 'google-map-script',
//     googleMapsApiKey: googleMapsApiKey,
//     libraries: libraries,
//   });

//   const onLoad = useCallback((ref) => {
//     setSearchBox(ref);
//   }, []);

//   const onPlacesChanged = () => {
//     if (searchBox) {
//       const places = searchBox.getPlaces();
//       if (places && places.length > 0) {
//         const place = places[0];
//         setNewReport((prev) => ({
//           ...prev,
//           location: place.formatted_address || '',
//         }));
//       }
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setNewReport({ ...newReport, [name]: value });
//   };

//   const handleFileChange = (e) => {
//     if (e.target.files && e.target.files[0]) {
//       const selectedFile = e.target.files[0];
//       setFile(selectedFile);
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         setPreview(e.target?.result);
//       };
//       reader.readAsDataURL(selectedFile);
//     }
//   };

//   const readFileAsBase64 = (file) => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onload = () => resolve(reader.result);
//       reader.onerror = reject;
//       reader.readAsDataURL(file);
//     });
//   };

//   const handleVerify = async () => {
//     if (!file) return;

//     setVerificationStatus('verifying');

//     try {
//       const genAI = new GoogleGenerativeAI(geminiApiKey);
//       const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

//       const base64Data = await readFileAsBase64(file);

//       const imageParts = [
//         {
//           inlineData: {
//             data: base64Data.split(',')[1],
//             mimeType: file.type,
//           },
//         },
//       ];

//       const prompt = `You are an expert in waste management and recycling. Analyze this image and provide:
//         1. The type of waste (e.g., plastic, paper, glass, metal, organic)
//         2. An estimate of the quantity or amount (in kg or liters)
//         3. Your confidence level in this assessment (as a percentage)
        
//         Respond in JSON format like this:
//         {
//           "wasteType": "type of waste",
//           "quantity": "estimated quantity with unit",
//           "confidence": confidence level as a number between 0 and 1
//         }`;

//       const result = await model.generateContent([prompt, ...imageParts]);
//       const response = await result.response;
//       const text = response.text();

//       try {
//         const parsedResult = JSON.parse(text);
//         if (parsedResult.wasteType && parsedResult.quantity && parsedResult.confidence) {
//           setVerificationResult(parsedResult);
//           setVerificationStatus('success');
//           setNewReport({
//             ...newReport,
//             type: parsedResult.wasteType,
//             amount: parsedResult.quantity,
//           });
//         } else {
//           console.error('Invalid verification result:', parsedResult);
//           setVerificationStatus('failure');
//         }
//       } catch (error) {
//         console.error('Failed to parse JSON response:', text);
//         setVerificationStatus('failure');
//       }
//     } catch (error) {
//       console.error('Error verifying waste:', error);
//       setVerificationStatus('failure');
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (verificationStatus !== 'success' || !user) {
//       toast.error('Please verify the waste before submitting or log in.');
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       const report = await createReport(
//         user.id,
//         newReport.location,
//         newReport.type,
//         newReport.amount,
//         preview || undefined,
//         verificationResult ? JSON.stringify(verificationResult) : undefined
//       );

//       const formattedReport = {
//         id: report.id,
//         location: report.location,
//         wasteType: report.wasteType,
//         amount: report.amount,
//         createdAt: new Date(report.createdAt).toISOString().split('T')[0],
//       };

//       setReports([formattedReport, ...reports]);
//       setNewReport({ location: '', type: '', amount: '' });
//       setFile(null);
//       setPreview(null);
//       setVerificationStatus('idle');
//       setVerificationResult(null);

//       toast.success(`Report submitted successfully! You've earned points for reporting waste.`);
//     } catch (error) {
//       console.error('Error submitting report:', error);
//       toast.error('Failed to submit report. Please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   useEffect(() => {
//     const checkUser = async () => {
//       const email = localStorage.getItem('userEmail');
//       if (email) {
//         let user = await getUserByEmail(email);
//         if (!user) {
//           user = await createUser(email, 'Anonymous User');
//         }
//         setUser(user);

//         const recentReports = await getRecentReports();
//         const formattedReports = recentReports.map((report) => ({
//           ...report,
//           createdAt: new Date(report.createdAt).toISOString().split('T')[0],
//         }));
//         setReports(formattedReports);
//       } else {
//         router.push('/login');
//       }
//     };
//     checkUser();
//   }, [router]);

//   return (
//     <div className="p-8 max-w-4xl mx-auto">
//       {/* The rest of your JSX remains the same */}
//     </div>
//   );
// }


import React from 'react';

export default function ReportPage() {
  return (
    <div>
      <h1>Report Page</h1>
      {/* Your page content here */}
    </div>
  );
}
