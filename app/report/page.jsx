'use client';

import { useState, useCallback, useEffect } from 'react';
import { Camera, Video, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { StandaloneSearchBox, useJsApiLoader } from '@react-google-maps/api';
import { createUser, getUserByEmail, createReport, getReportsByUserId } from '@/utils/db/actions';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const libraries = ['places'];

export default function ReportPage() {
  const [user, setUser] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const router = useRouter();

  const [reports, setReports] = useState([]);

  const [newReport, setNewReport] = useState({
    location: '',
    type: '',
    amount: '',
  });

  const [mediaFile, setMediaFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isPhoto, setIsPhoto] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('idle'); // 'idle' | 'verifying' | 'success' | 'failure'
  const [verificationResult, setVerificationResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchBox, setSearchBox] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey,
    libraries,
  });

  const onLoad = useCallback((ref) => {
    setSearchBox(ref);
  }, []);

  const onPlacesChanged = () => {
    if (!searchBox) return;

    const places = searchBox.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      const fullAddress =
        place.formatted_address ||
        `${place.name}, ${place.vicinity || ''}, ${place.address_components?.map(c => c.long_name).join(', ') || ''}`;

      setNewReport((prev) => ({
        ...prev,
        location: fullAddress,
      }));
    }
  };

  // Use browser geolocation + reverse geocode to set location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleMapsApiKey}`
          );
          const data = await response.json();
          if (data.status === 'OK' && data.results.length > 0) {
            const address = data.results[0].formatted_address;
            setNewReport((prev) => ({
              ...prev,
              location: address,
            }));
            toast.success('Current location set!');
          } else {
            toast.error('Failed to retrieve address from coordinates.');
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          toast.error('Error getting address from location.');
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Failed to get your location.');
      }
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReport((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setMediaFile(null);
      setPreview(null);
      return;
    }

    setMediaFile(selectedFile);
    setIsPhoto(selectedFile.type.startsWith('image/'));

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleCapturePhoto = (e) => {
    const capturedFile = e.target.files?.[0];
    if (!capturedFile) return;

    setMediaFile(capturedFile);
    setIsPhoto(true);

    const reader = new FileReader();
    reader.onload = (event) => setPreview(event.target.result);
    reader.readAsDataURL(capturedFile);
  };

  const handleCaptureVideo = (e) => {
    const capturedFile = e.target.files?.[0];
    if (!capturedFile) return;

    setMediaFile(capturedFile);
    setIsPhoto(false);

    const reader = new FileReader();
    reader.onload = (event) => setPreview(event.target.result);
    reader.readAsDataURL(capturedFile);
  };

  const isVerifyAvailable = isPhoto && mediaFile !== null;

  const readFileAsBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleVerify = async () => {
    if (!mediaFile || !isPhoto) {
      toast.error('Please upload or capture a photo to verify.');
      return;
    }

    setVerificationStatus('verifying');

    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const base64Data = await readFileAsBase64(mediaFile);

      const imageParts = [
        {
          inlineData: {
            data: base64Data.split(',')[1],
            mimeType: mediaFile.type,
          },
        },
      ];

      const prompt = `You are an expert in waste management and recycling. Analyze this image and provide:
1. The type of waste (e.g., plastic, paper, glass, metal, organic)
2. An estimate of the quantity or amount (in kg or liters)
3. Your confidence level in this assessment (as a percentage)

Respond in JSON format like this:
{
  "wasteType": "type of waste",
  "quantity": "estimated quantity with unit",
  "confidence": confidence level as a number between 0 and 1
}`;

      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      let text = await response.text();

      text = text.replace(/```json|```/g, '').trim();

      try {
        const parsedResult = JSON.parse(text);
        if (
          parsedResult.wasteType &&
          parsedResult.quantity &&
          typeof parsedResult.confidence === 'number'
        ) {
          setVerificationResult(parsedResult);
          setVerificationStatus('success');
          setNewReport((prev) => ({
            ...prev,
            type: parsedResult.wasteType,
            amount: parsedResult.quantity,
          }));
          toast.success('Verification successful!');
        } else {
          console.error('Invalid verification result:', parsedResult);
          setVerificationStatus('failure');
          toast.error('Verification failed: invalid data received.');
        }
      } catch (error) {
        console.error('Failed to parse JSON response:', text);
        setVerificationStatus('failure');
        toast.error('Verification failed: invalid response format.');
      }
    } catch (error) {
      console.error('Error verifying waste:', error);
      setVerificationStatus('failure');
      toast.error('Verification failed due to an error.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (verificationStatus !== 'success' || !user) {
      toast.error('Please verify the waste before submitting or log in.');
      return;
    }

    setIsSubmitting(true);
    try {
      const report = await createReport(
        user.id,
        newReport.location,
        newReport.type,
        newReport.amount,
        preview || undefined,
        verificationResult ? JSON.stringify(verificationResult) : undefined
      );

      const formattedReport = {
        id: report.id,
        location: report.location,
        wasteType: report.wasteType,
        amount: report.amount,
        status: report.status || 'In Progress',
        createdAt: new Date(report.createdAt).toISOString().split('T')[0],
      };

      setReports((prevReports) => [formattedReport, ...prevReports]);
      setNewReport({ location: '', type: '', amount: '' });
      setMediaFile(null);
      setPreview(null);
      setVerificationStatus('idle');
      setVerificationResult(null);

      toast.success(`Report submitted successfully! You've earned points for reporting waste.`);
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const checkUserAndFetchReports = async () => {
      const email = localStorage.getItem('userEmail');
      if (email) {
        let loggedInUser = await getUserByEmail(email);
        if (!loggedInUser) {
          loggedInUser = await createUser(email, 'Anonymous User');
        }
        setUser(loggedInUser);

        const userReports = await getReportsByUserId(loggedInUser.id);
        const formattedReports = userReports.map((report) => ({
          ...report,
          createdAt: new Date(report.createdAt).toISOString().split('T')[0],
          status: report.status || 'In Progress',
        }));

        setReports(formattedReports);
      } else {
        router.push('/login');
      }
    };

    checkUserAndFetchReports();
  }, [router]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Report Waste</h1>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg mb-12">
        <div className="mb-8">
          <label
            htmlFor="waste-media"
            className="block text-lg font-semibold text-gray-800 mb-3"
          >
            Upload or Capture Waste Media
          </label>

          {/* Capture buttons container with border */}
          <div className="flex justify-center gap-6 border border-gray-300 rounded-md p-4 bg-white max-w-md mx-auto">
            {/* Capture Photo */}
            <label
              htmlFor="capture-photo"
              className="inline-flex items-center gap-2 cursor-pointer
                 text-green-700 hover:text-green-900
                 font-medium select-none"
            >
              <Camera className="w-6 h-6" />
              <span>Capture Photo</span>
            </label>
            <input
              id="capture-photo"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCapturePhoto}
              className="hidden"
            />

            {/* Capture Video */}
            <label
              htmlFor="capture-video"
              className="inline-flex items-center gap-2 cursor-pointer
                 text-blue-700 hover:text-blue-900
                 font-medium select-none"
            >
              <Video className="w-6 h-6" />
              <span>Capture Video</span>
            </label>
            <input
              id="capture-video"
              type="file"
              accept="video/*"
              capture="environment"
              onChange={handleCaptureVideo}
              className="hidden"
            />
          </div>

          {/* Preview Section */}
          {preview && (
            <div className="mt-5 border rounded-md p-4 bg-gray-50 shadow-inner max-w-full">
              {isPhoto ? (
                <img
                  src={preview}
                  alt="Waste preview"
                  className="mx-auto max-w-full max-h-60 rounded-md object-contain"
                />
              ) : (
                <video
                  src={preview}
                  controls
                  className="mx-auto max-w-full max-h-60 rounded-md object-contain"
                />
              )}
            </div>
          )}
        </div>



        <div className="mb-8">
          <label htmlFor="location" className="block text-lg font-medium text-gray-700 mb-2">
            Location
          </label>

          {isLoaded ? (
            <StandaloneSearchBox
              onLoad={onLoad}
              onPlacesChanged={onPlacesChanged}
            >
              <input
                id="location"
                name="location"
                type="text"
                placeholder="Enter location"
                value={newReport.location}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </StandaloneSearchBox>
          ) : (
            <input
              id="location"
              name="location"
              type="text"
              placeholder="Enter location"
              value={newReport.location}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          )}

          <Button
            variant="outline"
            size="sm"
            className="mt-2 flex items-center gap-2"
            onClick={handleUseCurrentLocation}
            type="button"
          >
            <MapPin size={16} />
            Use Current Location
          </Button>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className="block text-lg font-medium text-gray-700 mb-2">
              Waste Type
            </label>
            <input
              id="type"
              name="type"
              type="text"
              placeholder="e.g., Plastic, Paper"
              value={newReport.type}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-lg font-medium text-gray-700 mb-2">
              Amount
            </label>
            <input
              id="amount"
              name="amount"
              type="text"
              placeholder="Estimated quantity (e.g., 3 kg)"
              value={newReport.amount}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>
        </div>

        <div className="mb-8 flex items-center gap-4">
          <Button
            type="button"
            onClick={handleVerify}
            disabled={!isVerifyAvailable || verificationStatus === 'verifying'}
          >
            {verificationStatus === 'verifying' ? 'Verifying...' : 'Verify Waste'}
          </Button>

          {verificationStatus === 'success' && (
            <p className="text-green-600">Verification successful ✅</p>
          )}
          {verificationStatus === 'failure' && (
            <p className="text-red-600">Verification failed ❌</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting || verificationStatus !== 'success'}>
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </Button>
      </form>

      <section className="px-4 py-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          📝 Your Waste Reports
        </h2>

        {reports.length === 0 ? (
          <p className="text-center text-gray-500">No reports submitted yet.</p>
        ) : (
          <ul className="flex flex-col space-y-6">
            {reports.map((report) => (
              <li
                key={report.id}
                className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition duration-300 flex space-x-6 items-start"
              >
                {/* Image Left with click handler */}
                <img
                  src={report.imageUrl}
                  alt="Uploaded media"
                  className="w-40 h-32 object-cover rounded shadow-sm flex-shrink-0 cursor-pointer"
                  onClick={() => setPreviewImage(report.imageUrl)}
                />

                {/* Content Right */}
                <div className="flex-1 space-y-2">
                  <p className="text-lg">
                    📍 <strong className="text-gray-600">Location:</strong> {report.location}
                  </p>
                  <p className="text-lg">
                    🗑️ <strong className="text-gray-600">Type:</strong> {report.wasteType}
                  </p>
                  <p className="text-lg">
                    ⚖️ <strong className="text-gray-600">Amount:</strong> {report.amount}
                  </p>
                  <p className="text-lg">
                    🔄 <strong className="text-gray-600">Status:</strong>{' '}
                    <span
                      className={`text-sm font-semibold px-3 py-1 rounded-full inline-block ${report.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : report.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : report.status === 'verified'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      {report.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    🕒 Reported On:{' '}
                    {new Date(report.createdAt).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Modal for image preview */}
        {previewImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            onClick={() => setPreviewImage(null)}
          >
            <div
              className="bg-white rounded-lg p-4 max-w-3xl max-h-full overflow-auto"
              onClick={(e) => e.stopPropagation()} // modal ke andar click ko bahar close se alag karne ke liye
            >
              <button
                className="text-gray-600 hover:text-gray-900 float-right text-xl font-bold mb-2"
                onClick={() => setPreviewImage(null)}
              >
                &times;
              </button>
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-[80vh] object-contain rounded"
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
