import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Upload, CheckCircle2, Lock, Unlock, KeyRound, RefreshCw, Trash2, ShieldCheck, HelpCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

// @ts-ignore
import officialGoonPhoto from '../assets/images/IMG_1832.webp';
// @ts-ignore
import fallbackPhoto from '../assets/images/goon_photo_1780334557569.png';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Firestore Sync Error: ', JSON.stringify(errInfo));
};

// Canvas Compressor to keep uploads way below the 1MB Firestore limit
const compressImage = (base64Str: string, maxWidth = 500, maxHeight = 650, quality = 0.75): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
};

export default function GoonCorner() {
  const [firebasePhoto, setFirebasePhoto] = useState<string | null>(null);
  const [dbPassword, setDbPassword] = useState<string>("Robloxlol123");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Local interface states
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [newPassword, setNewPassword] = useState<string>("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState<boolean>(false);

  // Firestore real-time listener hook
  useEffect(() => {
    const docRef = doc(db, 'settings', 'goonCorner');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.photoUrl) {
          setFirebasePhoto(data.photoUrl);
        } else {
          setFirebasePhoto(null);
        }
        if (data.password) {
          if (data.password === "socks") {
            // Auto-upgrade legacy default password to the requested Roblox password on the cloud
            updateDoc(docRef, { password: "Robloxlol123" }).catch(() => {});
            setDbPassword("Robloxlol123");
          } else {
            setDbPassword(data.password);
          }
        }
      } else {
        // Automatically initialize settings document if it doesn't exist
        setDoc(docRef, {
          photoUrl: "",
          password: "Robloxlol123"
        }).catch(err => {
          handleFirestoreError(err, OperationType.WRITE, 'settings/goonCorner');
        });
      }
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/goonCorner');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync password unlock status dynamically if password changes in database
  useEffect(() => {
    if (isUnlocked && passwordInput !== dbPassword) {
      // Re-verify the current password input
      if (passwordInput === dbPassword) {
        setIsUnlocked(true);
      } else {
        setIsUnlocked(false);
        setPasswordInput("");
        setStatusMessage({ text: "Password was changed on the cloud. Locked again.", isError: true });
      }
    }
  }, [dbPassword]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === dbPassword) {
      setIsUnlocked(true);
      setStatusMessage({ text: "Superb! Cloud edit access granted.", isError: false });
      setTimeout(() => setStatusMessage(null), 3500);
    } else {
      setStatusMessage({ text: "Incorrect password! Direct access denied.", isError: true });
    }
  };

  const handleCloudPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isUnlocked) {
      setStatusMessage({ text: "Please unlock editing permissions first.", isError: true });
      return;
    }

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setStatusMessage({ text: "Invalid file type. Please upload an image file.", isError: true });
        return;
      }

      setIsSaving(true);
      setStatusMessage({ text: "Processing under extreme mewing standards...", isError: false });

      const reader = new FileReader();
      reader.onload = async (event) => {
        const rawResult = event.target?.result;
        if (rawResult && typeof rawResult === 'string') {
          try {
            // Compress heavily for real-time Firestore transport
            const compressedStr = await compressImage(rawResult);
            
            const docRef = doc(db, 'settings', 'goonCorner');
            await updateDoc(docRef, {
              photoUrl: compressedStr
            });

            setStatusMessage({ text: "Goon Portrait updated successfully for EVERYONE!", isError: false });
            setTimeout(() => setStatusMessage(null), 4000);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, 'settings/goonCorner');
            setStatusMessage({ text: "Firebase storage update error.", isError: true });
          } finally {
            setIsSaving(false);
          }
        }
      };

      reader.onerror = () => {
        setStatusMessage({ text: "Failed to read the selected file.", isError: true });
        setIsSaving(false);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleResetToDefault = async () => {
    if (!isUnlocked) return;

    setIsSaving(true);
    setStatusMessage({ text: "Reverting to default physical portrait on cloud...", isError: false });

    try {
      const docRef = doc(db, 'settings', 'goonCorner');
      await updateDoc(docRef, {
        photoUrl: "" // Empty represents the static original fallback portrait
      });

      setStatusMessage({ text: "Reverted successfully! Everyone sees original portrait.", isError: false });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/goonCorner');
      setStatusMessage({ text: "Failed to reset portrait.", isError: true });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUnlocked) return;
    if (newPassword.trim().length === 0) {
      setStatusMessage({ text: "Password cannot be blank.", isError: true });
      return;
    }

    setIsUpdatingPassword(true);
    setStatusMessage({ text: "Encrypting new cloud secure key...", isError: false });

    try {
      const docRef = doc(db, 'settings', 'goonCorner');
      await updateDoc(docRef, {
        password: newPassword.trim()
      });

      setPasswordInput(newPassword.trim());
      setNewPassword("");
      setStatusMessage({ text: `Password successfully updated! New password is: ${newPassword.trim()}`, isError: false });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/goonCorner');
      setStatusMessage({ text: "Security rules or Firestore write failed.", isError: true });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const activePhotoSource = firebasePhoto ? firebasePhoto : officialGoonPhoto;

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] py-12 px-4 select-none">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="spinner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 text-slate-500"
          >
            <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Synchronizing with Cloud State...
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="content-frame"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative bg-slate-950 p-6 sm:p-8 rounded-[3rem] border border-slate-800 shadow-2xl shadow-black/50 max-w-sm w-full"
          >
            {/* Museum/Gallery style Frame */}
            <div className="relative overflow-hidden rounded-[2rem] aspect-[3/4] bg-slate-900 border-4 border-slate-800 shadow-inner group">
              <img
                id="goon_corner_display_image"
                src={activePhotoSource}
                alt="Official Goon Portrait"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Overlay Label */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-6 pt-12">
                <span className="text-[10px] font-black tracking-[0.2em] text-amber-500 uppercase block mb-1">
                  {firebasePhoto ? "SHARED LIVE CURRENT" : "SHARED DEFAULT PORTRAIT"}
                </span>
                <h3 className="text-lg font-black text-white uppercase italic tracking-tight">
                  THE ORIGINAL PORTRAIT
                </h3>
              </div>
            </div>

            {/* The Legendary Sock Chronicles (Placed directly below photo) */}
            <div className="mt-6 p-5 bg-slate-900/40 rounded-[1.5rem] border border-slate-800/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 text-2xl opacity-10 pointer-events-none select-none">
                🧦
              </div>
              <h4 className="text-[10px] font-black tracking-[0.2em] text-amber-500 uppercase mb-2">
                🧦 THE LEGENDARY SOCK CHRONICLES
              </h4>
              <p className="text-xs text-slate-300 font-medium leading-relaxed italic">
                Legend tells of the absolute champion of the Goon Corner, who never takes a break from the grind. With his favorite thick, comfortable socks pulled high, he locks into the ultimate mewing posture. He spends hours on end gooning in his socks—sliding around the room, mastering his aura points, and maintaining the flawless streak. The fabric of his socks holds the pure kinetic energy of his unstoppable focus, proving to everyone in the GameHub that he is truly built different, no cap.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  Goon Socks: Max Warmth
                </span>
                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  Status: Fully Slid
                </span>
              </div>
            </div>

            {/* Real-time Status Alert Banner */}
            {statusMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-3.5 rounded-2xl border text-[10px] font-bold uppercase tracking-wider flex items-start gap-2.5 ${
                  statusMessage.isError
                    ? "bg-rose-950/30 border-rose-900/30 text-rose-400"
                    : "bg-emerald-950/30 border-emerald-900/30 text-emerald-400"
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{statusMessage.text}</span>
              </motion.div>
            )}

            {/* Locked vs. Open Control Panel */}
            <div className="mt-6 border-t border-slate-900 pt-6">
              <AnimatePresence mode="wait">
                {!isUnlocked ? (
                  <motion.div
                    key="locked-auth"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div className="flex items-center gap-1.5 text-slate-400 mb-2">
                        <Lock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Secure Lock (Sync Active)
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <input
                          type="password"
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="Enter Password..."
                          className="flex-1 px-4 py-2 bg-slate-900 rounded-xl border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-850 active:scale-95 text-amber-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          Unlock
                        </button>
                      </div>

                      <div className="flex items-center gap-2 bg-slate-900/40 p-3 rounded-2xl border border-slate-900/50">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="text-[9px] text-slate-500 font-semibold leading-relaxed">
                          Changing the photo update propagates to <strong className="text-slate-400">every single person's device</strong> instantly. Locked to prevent edit hijacking. (Hint: default password is <code className="text-amber-500 bg-slate-950 px-1 py-0.5 rounded">Robloxlol123</code>)
                        </span>
                      </div>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="unlocked-controls"
                    initial={{ opacity: 1, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                          Edit Deck Actionable
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setIsUnlocked(false);
                          setPasswordInput("");
                          setStatusMessage(null);
                        }}
                        className="text-[9px] font-bold text-slate-500 hover:text-slate-350 bg-slate-900 px-2 py-1 rounded-lg uppercase tracking-wider"
                      >
                        Re-lock Console
                      </button>
                    </div>

                    {/* Uploader UI */}
                    <div className="flex flex-col items-center justify-center p-5 bg-slate-900/30 rounded-2xl border border-slate-850 text-center space-y-3">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                        Choose New Cloud Master Photo
                      </p>
                      
                      <input
                        type="file"
                        id="cloud-photo-file"
                        accept="image/*"
                        onChange={handleCloudPhotoUpload}
                        disabled={isSaving}
                        className="hidden"
                      />
                      
                      <label
                        htmlFor="cloud-photo-file"
                        className={`cursor-pointer flex items-center gap-2 px-5 py-2 text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          isSaving
                            ? "bg-slate-800 text-slate-500 pointer-events-none"
                            : "bg-amber-500 hover:bg-amber-550 active:scale-95"
                        }`}
                      >
                        {isSaving ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        Upload to Everyone
                      </label>

                      <button
                        onClick={handleResetToDefault}
                        disabled={isSaving || !firebasePhoto}
                        className={`flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl bg-rose-950/30 hover:bg-rose-950/60 text-rose-400 border border-rose-900/20 transition-all ${
                          isSaving || !firebasePhoto ? "opacity-40 pointer-events-none" : ""
                        }`}
                      >
                        <Trash2 className="w-3 h-3" /> Reset to Master Fallback
                      </button>
                    </div>

                    {/* Security Management (Update Password) */}
                    <form onSubmit={handleUpdatePassword} className="border-t border-slate-900 pt-4 space-y-3">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Modify Security Password
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="New secure password..."
                          disabled={isUpdatingPassword}
                          className="flex-1 px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                        />
                        <button
                          type="submit"
                          disabled={isUpdatingPassword || newPassword.trim().length === 0}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 active:scale-95 text-slate-400 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-wide border border-slate-850 transition-all disabled:opacity-40 disabled:pointer-events-none"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Static Lock Info Footer */}
            <div className="mt-6 text-center select-none">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-slate-600" /> Live Firestore Instance synced (Port 3000)
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
