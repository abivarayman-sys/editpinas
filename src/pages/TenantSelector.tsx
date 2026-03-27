import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Reseller } from '../store/useTenantStore';
import { useNavigate } from 'react-router-dom';

export default function TenantSelector() {
  const [tenants, setTenants] = useState<Reseller[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTenants() {
      try {
        const querySnapshot = await getDocs(collection(db, 'resellers'));
        const fetchedTenants = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reseller));
        setTenants(fetchedTenants);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'resellers');
      } finally {
        setLoading(false);
      }
    }
    fetchTenants();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-neutral-900 p-8 rounded-2xl border border-purple-500/20 shadow-2xl shadow-purple-900/20">
        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
          Select a Booth
        </h1>
        
        {loading ? (
          <div className="text-center text-neutral-400 py-8">Loading booths...</div>
        ) : tenants.length === 0 ? (
          <div className="text-center text-neutral-400 py-8">
            No booths available.
            <div className="mt-4">
              <button 
                onClick={() => navigate('/superadmin')}
                className="text-purple-400 hover:text-purple-300 underline text-sm"
              >
                Go to Super Admin to create one
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {tenants.map(tenant => (
              <button
                key={tenant.id}
                onClick={() => window.location.href = `/?tenant=${tenant.subdomain}`}
                className="w-full p-4 bg-neutral-800 hover:bg-neutral-700 rounded-xl border border-neutral-700 hover:border-purple-500/50 transition-all text-left flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-lg">{tenant.brandName}</div>
                  <div className="text-sm text-neutral-400">{tenant.subdomain}.editpinas.app</div>
                </div>
                <div className="text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </div>
              </button>
            ))}
            
            <div className="pt-6 mt-6 border-t border-neutral-800 text-center">
              <button 
                onClick={() => navigate('/superadmin')}
                className="text-neutral-500 hover:text-neutral-300 text-sm transition-colors"
              >
                Super Admin Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
