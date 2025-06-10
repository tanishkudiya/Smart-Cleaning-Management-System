// @ts-nocheck
'use client';

import { useRef, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES } from '@web3auth/base';
import {
  createUser,
  getUserByEmail,
  getUnreadNotifications,
  getUserBalance,
  markNotificationAsRead,
  saveVendorConfidentialInfo,
  getStaffByEmail,
} from '@/utils/db/actions';
import { Button } from './ui/button';
import {
  Menu,
  Coins,
  Leaf,
  Search,
  Bell,
  User,
  ChevronDown,
  LogIn,
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const clientId =
  'BISrhkqtCXtec89-2cpucSLDnx5Gryg_TZs2fmUB5tM2z5e9qyq6CnOk40r4EMXyshp4fvMqDezljKzdCSGq_bM';

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: '0xaa36a7', // Sepolia
  rpcTarget: 'https://rpc.ankr.com/eth_sepolia',
  displayName: 'Ethereum Sepolia Testnet',
  blockExplorerUrl: 'https://sepolia.etherscan.io',
  ticker: 'ETH',
  tickerName: 'Ethereum',
  logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
};

export default function Header({ onMenuClick, totalEarnings }) {
  const web3authRef = useRef(null);
  const [provider, setProvider] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const pathname = usePathname();
  const [notifications, setNotifications] = useState([]);
  const [balance, setBalance] = useState(0);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Role selection modal state
  const [selectedRole, setSelectedRole] = useState('user'); // default to 'user'
  const [showRoleSelect, setShowRoleSelect] = useState(false);
  const [showVendorInfoForm, setShowVendorInfoForm] = useState(false);
  const [vendorFormLoading, setVendorFormLoading] = useState(false);

  // Vendor info form state
  const [vendorInfo, setVendorInfo] = useState({
    name: '',
    email: '', // pre-filled/disabled
    company: '',
    idNumber: '',
    licenseNumber: '',
    address: '',
  });

  // Sync vendorInfo.email with userInfo.email once userInfo is loaded
  useEffect(() => {
    if (userInfo?.email) {
      setVendorInfo((prev) => ({ ...prev, email: userInfo.email }));
    }
  }, [userInfo?.email]);

  // Initialize Web3Auth and check if user is already logged in
  useEffect(() => {
    const init = async () => {
      try {
        const web3auth = new Web3Auth({
          clientId,
          web3AuthNetwork: 'sapphire_devnet',
          chainConfig,
        });

        await web3auth.init();
        web3authRef.current = web3auth;

        let user = null;
        if (web3auth.provider) {
          setProvider(web3auth.provider);
          user = await web3auth.getUserInfo();
        } else {
          // fallback localStorage
          const email = localStorage.getItem('userEmail');
          if (email) {
            // fetch user or staff by email
            const existingUser = await getUserByEmail(email);
            const existingStaff = await getStaffByEmail(email);

            if (existingUser) {
              setLoggedIn(true);
              setUserInfo(existingUser);
              setLoading(false);
              return; // stop here, already logged in
            }
            if (existingStaff) {
              setLoggedIn(true);
              setUserInfo(existingStaff);
              setLoading(false);
              return; // stop here, already logged in
            }
          }
        }

        if (user) {
          setUserInfo(user);
          if (user.email) {
            localStorage.setItem('userEmail', user.email);
            const existingUser = await getUserByEmail(user.email);
            const existingStaff = await getStaffByEmail(user.email);

            if (existingUser || existingStaff) {
              setLoggedIn(true);
            } else {
              // show role select only if no user or staff found
              setShowRoleSelect(true);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing Web3Auth:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // Fetch notifications on userInfo change and poll every 30 seconds
  useEffect(() => {
    const fetchNotifications = async () => {
      if (userInfo?.email) {
        const user = await getUserByEmail(userInfo.email);
        if (user) {
          const unread = await getUnreadNotifications(user.id);
          setNotifications(unread);
        }
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userInfo]);

  // Fetch user balance on userInfo change
  useEffect(() => {
    const fetchUserBalance = async () => {
      if (userInfo?.email) {
        const user = await getUserByEmail(userInfo.email);
        if (user) {
          const userBalance = await getUserBalance(user.id);
          setBalance(userBalance);
        }
      }
    };

    fetchUserBalance();

    // Listen for custom balanceUpdated event
    const handleBalanceUpdate = (event) => {
      setBalance(event.detail);
    };

    window.addEventListener('balanceUpdated', handleBalanceUpdate);
    return () => window.removeEventListener('balanceUpdated', handleBalanceUpdate);
  }, [userInfo]);

  // Login flow with Web3Auth
  const login = async () => {
    const web3auth = web3authRef.current;
    if (!web3auth) return;

    try {
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);

      const user = await web3auth.getUserInfo();
      setUserInfo(user);

      if (user.email) {
        localStorage.setItem('userEmail', user.email);

        const existingUser = await getUserByEmail(user.email);
        const existingStaff = await getStaffByEmail(user.email);

        if (existingUser || existingStaff) {
          setLoggedIn(true);
        } else {
          setShowRoleSelect(true);
        }
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  // Logout flow
  const logout = async () => {
    const web3auth = web3authRef.current;
    if (!web3auth) return;

    try {
      await web3auth.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setProvider(null);
      setLoggedIn(false);
      setUserInfo(null);
      localStorage.removeItem('userEmail');
    }
  };

  // Confirm role selection and create user
  const handleRoleConfirm = async () => {
    if (!userInfo?.email) return;

    try {
      await createUser(userInfo.email, userInfo.name || 'Anonymous User', selectedRole);

      if (selectedRole === 'vendor') {
        setShowRoleSelect(false);
        setShowVendorInfoForm(true);
      } else {
        setLoggedIn(true);
        setShowRoleSelect(false);
      }
    } catch (error) {
      console.error('Error creating user with role:', error);
    }
  };

  // Handle vendor info input change
  const handleVendorInfoChange = (e) => {
    const { name, value } = e.target;
    setVendorInfo((prev) => ({ ...prev, [name]: value }));
  };

  // Simple validation before submitting vendor info
  const validateVendorInfo = () => {
    if (
      !vendorInfo.name.trim() ||
      !vendorInfo.company.trim() ||
      !vendorInfo.idNumber.trim() ||
      !vendorInfo.licenseNumber.trim() ||
      !vendorInfo.address.trim()
    ) {
      alert('Please fill all vendor fields');
      return false;
    }
    return true;
  };

  // Submit vendor confidential info
  const handleVendorInfoSubmit = async () => {
    if (!validateVendorInfo()) return;

    setVendorFormLoading(true);
    try {
      await saveVendorConfidentialInfo({
        userEmail: userInfo.email,
        ...vendorInfo,
      });
      setShowVendorInfoForm(false);
      setLoggedIn(true);
    } catch (error) {
      console.error('Error saving vendor confidential info:', error);
      alert('Failed to save vendor info. Please try again.');
    } finally {
      setVendorFormLoading(false);
    }
  };

  // Mark notification as read
  const handleNotificationClick = async (notificationId) => {
    await markNotificationAsRead(notificationId);
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  if (loading) return <div className="p-4">Loading Web3Auth...</div>;

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex flex-wrap items-center justify-between px-4 py-2">
          {/* Left: Logo & Menu */}
          <div className="flex items-center flex-shrink-0">
            <Button variant="ghost" size="icon" className="mr-2 md:mr-4" onClick={onMenuClick}>
              <Menu className="h-6 w-6" />
            </Button>
            <Link href="/" className="flex items-center">
              <Leaf className="h-6 w-6 md:h-8 md:w-8 text-blue-500 mr-2" />
              <div className="flex flex-col">
                <span className="font-bold text-sm sm:text-base md:text-lg text-gray-800">
                  E-Swachh
                </span>
                <span className="text-[10px] sm:text-xs text-gray-500 -mt-1">
                  Powered by Eways Private Services Limited.
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Search (Desktop only) */}
          {!isMobile && (
            <div className="flex-1 max-w-xl mx-4 hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
            </div>
          )}

          {/* Right: Actions */}
          <div className="flex items-center space-x-2 mt-2 md:mt-0">
            {/* Search (mobile) */}
            {isMobile && (
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
            )}

            <div className="flex items-center space-x-2 md:space-x-3">
              {/* Notifications */}
              {loggedIn && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      {notifications.length > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-1 -right-1 rounded-full h-4 w-4 flex items-center justify-center text-[10px]"
                        >
                          {notifications.length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72 max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">No new notifications</div>
                    ) : (
                      notifications.map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification.id)}
                          className="cursor-pointer"
                        >
                          {notification.message}
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Balance */}
              {loggedIn && (
                <div className="flex items-center bg-gray-100 rounded-full px-2 py-1">
                  <Coins className="h-4 w-4 mr-1 text-green-500" />
                  <span className="text-sm font-semibold text-gray-800">{balance.toFixed(2)}</span>
                </div>
              )}

              {/* User Dropdown or Login */}
              {loggedIn && userInfo ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center space-x-1 md:space-x-2 px-2">
                      <User className="h-5 w-5" />
                      <span className="hidden sm:inline truncate max-w-[100px]">{userInfo.name || userInfo.email}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={login} variant="default" size="sm" className="flex items-center space-x-2">
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Role Selection Modal */}
      {showRoleSelect && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4">Select Your Role</h2>
            <select
              className="w-full p-2 border border-gray-300 rounded mb-4"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="user">User</option>
              <option value="vendor">Vendor</option>
            </select>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowRoleSelect(false)}>
                Cancel
              </Button>
              <Button onClick={handleRoleConfirm}>Confirm</Button>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Info Form Modal */}
      {showVendorInfoForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Enter Vendor Details</h2>

            <input
              name="name"
              value={vendorInfo.name}
              onChange={handleVendorInfoChange}
              placeholder="Name"
              className="w-full p-2 border border-gray-300 rounded mb-3"
              disabled={vendorFormLoading}
            />
            <input
              name="email"
              value={vendorInfo.email}
              disabled
              className="w-full p-2 border border-gray-300 rounded mb-3 bg-gray-100"
            />
            <input
              name="company"
              value={vendorInfo.company}
              onChange={handleVendorInfoChange}
              placeholder="Company Name"
              className="w-full p-2 border border-gray-300 rounded mb-3"
              disabled={vendorFormLoading}
            />
            <input
              name="idNumber"
              value={vendorInfo.idNumber}
              onChange={handleVendorInfoChange}
              placeholder="ID Number"
              className="w-full p-2 border border-gray-300 rounded mb-3"
              disabled={vendorFormLoading}
            />
            <input
              name="licenseNumber"
              value={vendorInfo.licenseNumber}
              onChange={handleVendorInfoChange}
              placeholder="License Number"
              className="w-full p-2 border border-gray-300 rounded mb-3"
              disabled={vendorFormLoading}
            />
            <input
              name="address"
              value={vendorInfo.address}
              onChange={handleVendorInfoChange}
              placeholder="Address"
              className="w-full p-2 border border-gray-300 rounded mb-3"
              disabled={vendorFormLoading}
            />

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowVendorInfoForm(false)} disabled={vendorFormLoading}>
                Cancel
              </Button>
              <Button onClick={handleVendorInfoSubmit} disabled={vendorFormLoading}>
                {vendorFormLoading ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
