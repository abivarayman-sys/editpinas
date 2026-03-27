import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { useAuthStore } from './store/useAuthStore';
import { useTenantStore, Reseller, AppUser } from './store/useTenantStore';
import { ErrorBoundary } from './components/ErrorBoundary';

// Pages
import AttractionScreen from './pages/AttractionScreen';
import CoreEngine from './pages/CoreEngine';
import TopUp from './pages/TopUp';
import ResellerAdmin from './pages/ResellerAdmin';
import SuperAdmin from './pages/SuperAdmin';
import TenantSelector from './pages/TenantSelector';
import Refer from './pages/Refer';

function AppContent() {
  const [searchParams] = useSearchParams();
  const rawTenant = searchParams.get('tenant');
  const tenantIdExact = rawTenant ? rawTenant.trim() : null;
  const tenantSubdomainLower = rawTenant ? rawTenant.toLowerCase().trim() : null;
  const location = useLocation();
  const { setUser, setAuthReady, user, isAuthReady } = useAuthStore();
  const { currentTenant, setCurrentTenant, setCurrentUserData } = useTenantStore();
  const navigate = useNavigate();
  const [isResolvingTenant, setIsResolvingTenant] = useState(false);
  const [tenantError, setTenantError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
      
      if (firebaseUser && currentTenant) {
        // Fetch or create user document
        try {
          const userRef = doc(db, 'resellers', currentTenant.id, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            setCurrentUserData(userSnap.data() as AppUser);
          } else {
            const newUser: AppUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Guest',
              credits: 0,
              status: 'verified',
              totalCreditPurchased: 0,
              photosGenerated: 0
            };
            await setDoc(userRef, newUser);
            setCurrentUserData(newUser);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `resellers/${currentTenant.id}/users/${firebaseUser.uid}`);
        }
      } else {
        setCurrentUserData(null);
      }
    });
    return () => unsubscribe();
  }, [setUser, setAuthReady, currentTenant, setCurrentUserData]);

  useEffect(() => {
    async function resolveTenant() {
      if (!tenantIdExact || !tenantSubdomainLower) return;
      
      setIsResolvingTenant(true);
      setTenantError(null);
      try {
        // First try to find by exact document ID (case-sensitive)
        const docRef = doc(db, 'resellers', tenantIdExact);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setCurrentTenant({ id: docSnap.id, ...docSnap.data() } as Reseller);
        } else {
          // Fallback to querying by subdomain field (lowercase)
          const q = query(collection(db, 'resellers'), where('subdomain', '==', tenantSubdomainLower));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            setCurrentTenant({ id: doc.id, ...doc.data() } as Reseller);
          } else {
            setCurrentTenant(null);
            setTenantError(`No booth found with ID or subdomain: "${tenantIdExact}"`);
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'resellers');
        setTenantError(`Error fetching booth: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsResolvingTenant(false);
      }
    }
    
    resolveTenant();
  }, [tenantIdExact, tenantSubdomainLower, setCurrentTenant]);

  if (!isAuthReady || isResolvingTenant) {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Loading...</div>;
  }

  if (!tenantIdExact && location.pathname !== '/superadmin') {
    return <TenantSelector />;
  }

if (tenantSubdomainLower && tenantError) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white p-4 text-center">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Tenant Not Found</h1>
        <p className="text-neutral-400 mb-8">{tenantError}</p>
        <button onClick={() => navigate('/')} className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl font-bold transition-colors">
          View All Booths
        </button>
      </div>
    );
  }

  if (currentTenant?.maintenanceMode) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white p-4 text-center">
        <h1 className="text-4xl font-bold mb-4 text-purple-500">Be Right Back</h1>
        <p className="text-neutral-400 max-w-md">
          {currentTenant.brandName} is currently undergoing maintenance. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<AttractionScreen />} />
      <Route path="/engine" element={<CoreEngine />} />
      <Route path="/topup" element={<TopUp />} />
      <Route path="/admin" element={<ResellerAdmin />} />
      <Route path="/superadmin" element={<SuperAdmin />} />
      <Route path="/refer" element={<Refer />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
