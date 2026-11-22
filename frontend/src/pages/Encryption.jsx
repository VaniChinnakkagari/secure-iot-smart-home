import { useState, useEffect } from 'react';
import { 
  Lock, Unlock, CheckCircle2, ChevronRight, 
  Zap, Calculator, ArrowRight, Grid3X3, Info
} from 'lucide-react';

// --- CIPHER MATHEMATICS ---
const caesarCipher = (str, shift) => {
  return str.replace(/[a-zA-Z]/g, (char) => {
    const base = char <= 'Z' ? 65 : 97;
    return String.fromCharCode(((char.charCodeAt(0) - base + shift + 26) % 26) + base);
  });
};

const substitutionCipher = (str, key, decrypt = false) => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, '');
  if (normalizedKey.length !== 26 || new Set(normalizedKey).size !== 26) throw new Error("Key must be 26 unique letters.");
  
  const from = decrypt ? normalizedKey : alphabet;
  const to = decrypt ? alphabet : normalizedKey;

  return str.toLowerCase().replace(/[a-z]/g, (char) => {
    const idx = from.indexOf(char);
    return idx !== -1 ? to[idx] : char;
  });
};

const transpositionCipher = (str, key, decrypt = false) => {
  const numCols = parseInt(key);
  if (isNaN(numCols) || numCols < 2) throw new Error("Key must be >= 2");
  const cleanStr = str.replace(/[^a-zA-Z]/g, '').toUpperCase();
  const numRows = Math.ceil(cleanStr.length / numCols);
  
  let result = '';
  if (!decrypt) {
    for (let c = 0; c < numCols; c++) {
      for (let r = 0; r < numRows; r++) {
        const index = r * numCols + c;
        if (index < cleanStr.length) result += cleanStr[index];
      }
    }
  } else {
    let grid = Array(numRows).fill(null).map(() => Array(numCols).fill(''));
    let idx = 0;
    for (let c = 0; c < numCols; c++) {
      for (let r = 0; r < numRows; r++) {
        if (r * numCols + c < cleanStr.length) grid[r][c] = cleanStr[idx++];
      }
    }
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        if (grid[r][c] !== '') result += grid[r][c];
      }
    }
  }
  return result;
};

const buf2hex = (buffer) => Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
const hex2buf = (hex) => new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

export default function Encryption() {
  const [category, setCategory] = useState('classical');
  const [algorithm, setAlgorithm] = useState('Caesar');
  
  const [plaintext, setPlaintext] = useState('Vani Chinnakkagari');
  const [ciphertext, setCiphertext] = useState('');
  const [decrypted, setDecrypted] = useState('');
  
  const [shift, setShift] = useState(3);
  const [subKey, setSubKey] = useState('qwertyuiopasdfghjklzxcvbnm');
  const [transKey, setTransKey] = useState(4);
  const [aesKey, setAesKey] = useState('MySecureIoT2026!');
  const [iv, setIv] = useState('');
  const [rsaKeys, setRsaKeys] = useState(null);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [mathSteps, setMathSteps] = useState([]);
  const [transGrid, setTransGrid] = useState(null);

  useEffect(() => {
    setCiphertext(''); setDecrypted(''); setError(''); setIv(''); setMathSteps([]); setTransGrid(null);
    if (algorithm === 'RSA' && !rsaKeys) generateRSA();
  }, [algorithm]);

  const generateRSA = async () => {
    setLoading(true);
    try {
      const keyPair = await window.crypto.subtle.generateKey(
        { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
        true, ["encrypt", "decrypt"]
      );
      setRsaKeys(keyPair);
    } catch (err) { setError("Failed to generate RSA keys."); } 
    finally { setLoading(false); }
  };

  const handleEncrypt = async () => {
    if (!plaintext) { setError('Enter a message.'); return; }
    setError(''); setDecrypted(''); setCiphertext(''); setMathSteps([]); setTransGrid(null); setLoading(true);

    try {
      if (algorithm === 'Caesar') {
        const result = caesarCipher(plaintext, Number(shift));
        setCiphertext(result);
        
        const steps = Array.from(plaintext).map((char) => {
          if (char === ' ') return { char: 'SPACE', calc: 'Ignored', result: ' ' };
          if (!/[a-zA-Z]/.test(char)) return { char, calc: 'Ignored (Not a letter)', result: char };
          
          const base = char <= 'Z' ? 65 : 97;
          const pos = char.charCodeAt(0) - base;
          const newPos = (pos + Number(shift)) % 26;
          return { 
            char, 
            calc: `Pos ${pos} + Shift ${shift} = ${newPos}`, 
            result: String.fromCharCode(newPos + base) 
          };
        });
        setMathSteps(steps);
      } 
      else if (algorithm === 'Substitution') {
        const result = substitutionCipher(plaintext, subKey, false);
        setCiphertext(result);
        
        const alphabet = 'abcdefghijklmnopqrstuvwxyz';
        const normKey = subKey.toLowerCase().replace(/[^a-z]/g, '');
        const steps = Array.from(plaintext).map((char) => {
          if (char === ' ') return { char: 'SPACE', calc: 'Ignored', result: ' ' };
          if (!/[a-zA-Z]/.test(char)) return { char, calc: 'Ignored', result: char };
          const idx = alphabet.indexOf(char.toLowerCase());
          return { char, calc: `Map Index ${idx} to Key[${idx}]`, result: normKey[idx] };
        });
        setMathSteps(steps);
      }
      else if (algorithm === 'Transposition') {
        setCiphertext(transpositionCipher(plaintext, Number(transKey), false));
        
        const cleanStr = plaintext.replace(/[^a-zA-Z]/g, '').toUpperCase();
        const numCols = parseInt(transKey);
        const numRows = Math.ceil(cleanStr.length / numCols);
        
        let grid = Array(numRows).fill(null).map(() => Array(numCols).fill(''));
        let idx = 0;
        for (let r = 0; r < numRows; r++) {
          for (let c = 0; c < numCols; c++) {
            if (idx < cleanStr.length) {
              grid[r][c] = cleanStr[idx++];
            }
          }
        }
        setTransGrid({ grid, numCols, numRows });
        
        setMathSteps([
          { char: 'Grid', calc: `Write text row-by-row into ${numCols} columns.`, result: 'Filled' },
          { char: 'Read', calc: `Read downwards column-by-column.`, result: 'Scrambled' }
        ]);
      }
      else if (algorithm.includes('AES')) {
        const enc = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey('raw', enc.encode(aesKey.padEnd(32, '0').slice(0, 32)), { name: 'PBKDF2' }, false, ['deriveBits', 'deriveKey']);
        const key = await window.crypto.subtle.deriveKey({ name: 'PBKDF2', salt: enc.encode('salt'), iterations: 100000, hash: 'SHA-256' }, keyMaterial, { name: algorithm === 'AES-256-GCM' ? 'AES-GCM' : 'AES-CBC', length: 256 }, true, ['encrypt', 'decrypt']);
        const ivArray = window.crypto.getRandomValues(new Uint8Array(algorithm === 'AES-256-GCM' ? 12 : 16));
        const ivHex = buf2hex(ivArray);
        setIv(ivHex);
        
        const encrypted = await window.crypto.subtle.encrypt({ name: algorithm === 'AES-256-GCM' ? 'AES-GCM' : 'AES-CBC', iv: ivArray }, key, enc.encode(plaintext));
        setCiphertext(buf2hex(encrypted));

        setMathSteps([
          { char: 'Key', calc: 'Derived via PBKDF2', result: buf2hex(await window.crypto.subtle.exportKey('raw', key)) },
          { char: 'IV', calc: 'Random Initialization Vector', result: ivHex },
          { char: 'Data', calc: `Encrypted using ${algorithm}`, result: 'Hex Output' }
        ]);
      } 
      else if (algorithm === 'RSA') {
        const enc = new TextEncoder();
        const encrypted = await window.crypto.subtle.encrypt({ name: "RSA-OAEP" }, rsaKeys.publicKey, enc.encode(plaintext));
        setCiphertext(buf2hex(encrypted));
        setMathSteps([
          { char: 'Key', calc: 'Extracted Public Key (n, e)', result: 'RSA-2048' },
          { char: 'Data', calc: 'C = m^e mod n (RSA-OAEP padding)', result: 'Hex Output' }
        ]);
      }
    } catch (err) { setError(err.message || 'Encryption failed.'); } 
    finally { setLoading(false); }
  };

  const handleDecrypt = async () => {
    if (!ciphertext) { setError('No ciphertext.'); return; }
    setError(''); setDecrypted(''); setLoading(true);
    try {
      if (algorithm === 'Caesar') setDecrypted(caesarCipher(ciphertext, -Number(shift)));
      else if (algorithm === 'Substitution') setDecrypted(substitutionCipher(ciphertext, subKey, true));
      else if (algorithm === 'Transposition') setDecrypted(transpositionCipher(ciphertext, Number(transKey), true));
      else if (algorithm.includes('AES')) {
        const enc = new TextEncoder(); const dec = new TextDecoder();
        const keyMaterial = await window.crypto.subtle.importKey('raw', enc.encode(aesKey.padEnd(32, '0').slice(0, 32)), { name: 'PBKDF2' }, false, ['deriveBits', 'deriveKey']);
        const key = await window.crypto.subtle.deriveKey({ name: 'PBKDF2', salt: enc.encode('salt'), iterations: 100000, hash: 'SHA-256' }, keyMaterial, { name: algorithm === 'AES-256-GCM' ? 'AES-GCM' : 'AES-CBC', length: 256 }, true, ['encrypt', 'decrypt']);
        const decryptedBuffer = await window.crypto.subtle.decrypt({ name: algorithm === 'AES-256-GCM' ? 'AES-GCM' : 'AES-CBC', iv: hex2buf(iv) }, key, hex2buf(ciphertext));
        setDecrypted(dec.decode(decryptedBuffer));
      } 
      else if (algorithm === 'RSA') {
        const dec = new TextDecoder();
        const decryptedBuffer = await window.crypto.subtle.decrypt({ name: "RSA-OAEP" }, rsaKeys.privateKey, hex2buf(ciphertext));
        setDecrypted(dec.decode(decryptedBuffer));
      }
    } catch (err) { setError('Decryption failed. Incorrect key.'); } 
    finally { setLoading(false); }
  };

  const getPlaceholder = () => {
    if (algorithm === 'Caesar') return "Enter a message (e.g. Hello World)...";
    if (algorithm === 'Substitution') return "Enter letters to map...";
    if (algorithm === 'Transposition') return "Enter a long sentence to scramble...";
    if (algorithm.includes('AES')) return "Enter secure data to encrypt...";
    if (algorithm === 'RSA') return "Enter short message for public key...";
    return "Enter message...";
  };

  // UNIFIED BLUE THEME FOR ALL
  const accentColor = '#7226FF';

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Header */}
      <div className="glass p-8 rounded-3xl border border-[#7226FF]/30 relative overflow-hidden flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-gradient-to-tr from-[#7226FF] to-[#D8B4FE] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(114,38,255,0.4)] mb-4">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight mb-2">Cryptographic Laboratory</h1>
        <p className="text-[#D8B4FE] text-lg max-w-2xl">Explore Classical and Modern Encryption algorithms in real-time.</p>
      </div>

      {/* Selectors */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10 w-full md:w-auto">
          <button onClick={() => { setCategory('classical'); setAlgorithm('Caesar'); }} className={`flex-1 md:w-40 py-3 rounded-xl font-bold transition-all ${category === 'classical' ? 'bg-[#7226FF] text-white shadow-lg' : 'text-white/50 hover:text-white'}`}>Classical</button>
          <button onClick={() => { setCategory('modern'); setAlgorithm('AES-256-GCM'); }} className={`flex-1 md:w-40 py-3 rounded-xl font-bold transition-all ${category === 'modern' ? 'bg-[#7226FF] text-white shadow-lg' : 'text-white/50 hover:text-white'}`}>Modern</button>
        </div>

        <select 
          value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}
          className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 text-white font-bold text-lg appearance-none cursor-pointer focus:outline-none"
          style={{ colorScheme: 'dark' }}
        >
          {category === 'classical' ? (
            <>
              <option value="Caesar" style={{ backgroundColor: '#010030' }}>Caesar Cipher</option>
              <option value="Substitution" style={{ backgroundColor: '#010030' }}>Substitution Cipher</option>
              <option value="Transposition" style={{ backgroundColor: '#010030' }}>Transposition Cipher</option>
            </>
          ) : (
            <>
              <option value="AES-256-GCM" style={{ backgroundColor: '#010030' }}>AES-256-GCM</option>
              <option value="AES-256-CBC" style={{ backgroundColor: '#010030' }}>AES-256-CBC</option>
              <option value="RSA" style={{ backgroundColor: '#010030' }}>RSA (2048-bit)</option>
            </>
          )}
        </select>
      </div>

      {/* Dual Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Encrypt */}
        <div className="glass p-6 rounded-3xl border border-white/10 flex flex-col gap-5" style={{ borderTopColor: accentColor, borderTopWidth: 2 }}>
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${accentColor}20` }}>
              <Lock className="w-6 h-6" style={{ color: accentColor }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Encrypt ({algorithm})</h2>
              <p className="text-sm text-[#D8B4FE]/70">Convert plaintext to ciphertext.</p>
            </div>
          </div>

          <textarea 
            className="w-full p-4 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-sm h-32 focus:outline-none resize-none"
            placeholder={getPlaceholder()} value={plaintext} onChange={(e) => setPlaintext(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            {algorithm === 'Caesar' && (
              <div className="col-span-2">
                <label className="text-xs font-bold text-[#D8B4FE] uppercase mb-1 block">Shift Key</label>
                <input type="number" value={shift} onChange={e => setShift(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white" />
              </div>
            )}
            {algorithm === 'Substitution' && (
              <div className="col-span-2">
                <label className="text-xs font-bold text-[#D8B4FE] uppercase mb-1 block">26-Letter Key</label>
                <input type="text" value={subKey} onChange={e => setSubKey(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white font-mono" />
              </div>
            )}
            {algorithm === 'Transposition' && (
              <div className="col-span-2">
                <label className="text-xs font-bold text-[#D8B4FE] uppercase mb-1 block">Columns</label>
                <input type="number" value={transKey} onChange={e => setTransKey(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white" />
              </div>
            )}
            {(algorithm.includes('AES')) && (
              <div className="col-span-2">
                <label className="text-xs font-bold text-[#D8B4FE] uppercase mb-1 block">Password</label>
                <input type="password" value={aesKey} onChange={e => setAesKey(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white" />
              </div>
            )}
            {algorithm === 'RSA' && (
              <div className="col-span-2 flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-sm text-white">{rsaKeys ? 'Keys Ready ✔' : 'Generating...'}</span>
              </div>
            )}
          </div>

          <button onClick={handleEncrypt} disabled={loading} className="w-full py-3 rounded-xl font-bold text-white mt-2 hover:opacity-90" style={{ backgroundColor: accentColor }}>
            {loading ? 'Processing...' : 'Encrypt Data'}
          </button>

          {ciphertext && (
            <div className="p-4 bg-black/50 rounded-xl border border-white/10 mt-2">
              <p className="text-xs font-bold text-[#D8B4FE] mb-1">Ciphertext</p>
              <p className="font-mono text-sm text-white break-all">{ciphertext}</p>
            </div>
          )}
        </div>

        {/* Decrypt */}
        <div className="glass p-6 rounded-3xl border border-white/10 flex flex-col gap-5" style={{ borderTopColor: accentColor, borderTopWidth: 2 }}>
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${accentColor}20` }}>
              <Unlock className="w-6 h-6" style={{ color: accentColor }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Decrypt</h2>
              <p className="text-sm text-[#D8B4FE]/70">Restore plaintext.</p>
            </div>
          </div>

          <textarea 
            className="w-full p-4 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-sm h-32 focus:outline-none resize-none"
            placeholder="Paste ciphertext..." value={ciphertext} onChange={(e) => setCiphertext(e.target.value)}
          />

          <button onClick={handleDecrypt} disabled={loading || !ciphertext} className="w-full py-3 rounded-xl font-bold text-white mt-2 hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: accentColor }}>
            {loading ? 'Processing...' : 'Decrypt Data'}
          </button>

          {error && <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}

          {decrypted && (
            <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/30 mt-2">
              <p className="text-xs font-bold text-green-400 mb-1 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Decrypted</p>
              <p className="font-mono text-sm text-white break-all">{decrypted}</p>
            </div>
          )}
        </div>
      </div>

      {/* STEP-BY-STEP VISUALIZER */}
      <div className="mt-8 glass p-8 rounded-3xl border border-white/10 relative overflow-hidden">
        <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-2">
          <Zap className="w-6 h-6 text-[#00C8F0]" /> Step-by-Step: {algorithm}
        </h3>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 mb-10">
          <div className="flex flex-col items-center gap-3 w-full md:w-auto">
            <span className="text-xs font-bold text-[#D8B4FE] uppercase tracking-widest">Input</span>
            <div className="px-6 py-4 bg-black/50 border border-[#7226FF]/50 rounded-xl text-2xl font-mono text-white shadow-[0_0_20px_rgba(114,38,255,0.2)]">
              {plaintext || '...'}
            </div>
          </div>

          <ChevronRight className="w-8 h-8 text-white/20 rotate-90 md:rotate-0" />

          <div className="flex flex-col items-center gap-3 w-full md:w-auto">
            <span className="text-xs font-bold text-[#D8B4FE] uppercase tracking-widest">Transformation</span>
            <div className="px-6 py-4 bg-[#f59e0b]/10 border border-[#f59e0b]/50 rounded-xl text-sm font-bold text-[#f59e0b] text-center max-w-[250px]">
              {algorithm === 'Caesar' && `Shift alphabet by +${shift} positions`}
              {algorithm === 'Substitution' && `Map letters using 26-letter key`}
              {algorithm === 'Transposition' && `Write in grid of ${transKey} cols, read column-wise`}
              {algorithm === 'AES-256-GCM' && `AES Rounds + IV + Auth Tag`}
              {algorithm === 'AES-256-CBC' && `AES Rounds + IV Chaining`}
              {algorithm === 'RSA' && `Encrypt with Public Key (RSA-OAEP)`}
            </div>
          </div>

          <ChevronRight className="w-8 h-8 text-white/20 rotate-90 md:rotate-0" />

          <div className="flex flex-col items-center gap-3 w-full md:w-auto">
            <span className="text-xs font-bold text-[#D8B4FE] uppercase tracking-widest">Output</span>
            <div className="px-6 py-4 bg-[#00C8F0]/10 border border-[#00C8F0]/50 rounded-xl text-lg font-mono text-[#00C8F0] break-all max-w-[300px] text-center">
              {ciphertext || '...'}
            </div>
          </div>
        </div>

        {/* DYNAMIC MATH EXPLANATION */}
        {mathSteps.length > 0 && (
          <div className="mt-8 border-t border-white/10 pt-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#f59e0b]" /> Calculation Details
              </h4>
            </div>
            
            {/* IF TRANSPOSITION: SHOW THE GRID MATRIX */}
            {algorithm === 'Transposition' && transGrid && (
              <div className="bg-black/30 border border-white/10 rounded-2xl p-6 flex flex-col items-center mb-6">
                <div className="flex items-center gap-2 mb-4 text-[#f59e0b]">
                  <Grid3X3 className="w-5 h-5" />
                  <span className="text-sm font-bold uppercase tracking-widest">Visual Grid ({transGrid.numCols} Columns)</span>
                </div>
                
                <div className="flex flex-col gap-2">
                  {transGrid.grid.map((row, rIdx) => (
                    <div key={rIdx} className="flex gap-2">
                      {row.map((char, cIdx) => (
                        <div 
                          key={cIdx} 
                          className={`w-10 h-10 flex items-center justify-center font-mono text-lg font-bold rounded border ${
                            char ? 'bg-[#160078] text-white border-[#7226FF]/50 shadow-[0_0_10px_rgba(114,38,255,0.2)]' : 'bg-black/20 border-white/5 text-transparent'
                          }`}
                        >
                          {char || '-'}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex items-center gap-2 text-xs text-[#00C8F0] bg-[#00C8F0]/10 px-4 py-2 rounded-lg border border-[#00C8F0]/30">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                  Read column by column downwards to get ciphertext.
                </div>
              </div>
            )}

            {/* MATH CARDS - FIXED OVERLAP BY USING flex-wrap AND break-all */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mathSteps.map((step, idx) => (
                <div key={idx} className="bg-black/40 border border-white/10 rounded-xl p-5 flex flex-col gap-4 hover:border-[#7226FF]/50 transition-colors">
                  {/* Header Row */}
                  <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                    <span className="text-sm font-bold text-[#D8B4FE] uppercase tracking-widest">{step.char}</span>
                    <ArrowRight className="w-4 h-4 text-[#D8B4FE]/50" />
                    <span className="text-sm font-bold text-[#00C8F0] uppercase tracking-widest">{step.result.slice(0, 10)}...</span>
                  </div>
                  {/* Value Display */}
                  <div className="text-lg font-mono text-white bg-[#160078]/80 p-3 rounded-lg border border-[#7226FF]/30 break-all shadow-[0_0_15px_rgba(114,38,255,0.2)]">
                    {step.result}
                  </div>
                  {/* Explanation Footer */}
                  <div className="text-xs text-[#D8B4FE] text-center bg-black/40 p-2 rounded border border-white/5 mt-auto">
                    {step.calc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- DYNAMIC EXPLANATION PANEL --- */}
      <div className="glass p-8 rounded-3xl border border-[#00C8F0]/30 bg-gradient-to-br from-[#010030] to-[#160078] relative overflow-hidden animate-in fade-in duration-700">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00C8F0]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
          <Info className="w-6 h-6 text-[#00C8F0]" />
          How does {algorithm} work? 
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          
          {/* LEFT SIDE: ANALOGY CHANGES PER ALGORITHM */}
          <div className="space-y-4 text-white/80 leading-relaxed">
            {algorithm === 'Caesar' && (
              <>
                <p className="text-lg text-white font-bold">Imagine passing a secret note in class.</p>
                <p>If you write <strong>"HELLO"</strong>, anyone can read it. So, you and your friend agree on a <strong>Secret Rule</strong>.</p>
                <p>The rule is: <em>"Move every letter {shift} steps forward in the alphabet."</em></p>
                <div className="bg-black/40 p-4 rounded-xl border border-white/10 mt-4">
                  <p className="font-mono text-sm"><span className="text-[#00C8F0]">H</span> → I → J → K → <span className="text-[#f59e0b]">L</span></p>
                  <p className="text-xs text-white/50 mt-2">(H jumps {shift} spots to become L)</p>
                </div>
                <p>So, <strong>"HELLO"</strong> becomes <strong>"LIPPS"</strong>. Only your friend knows to shift it back!</p>
              </>
            )}

            {algorithm === 'Substitution' && (
              <>
                <p className="text-lg text-white font-bold">Imagine a Secret Decoder Ring.</p>
                <p>Instead of just shifting the alphabet, you create a <strong>completely random new alphabet</strong>.</p>
                <p>You write out A-Z, and below it, you write a 26-letter secret key. If someone says 'A', you look down and write 'Q' instead.</p>
                <div className="bg-black/40 p-4 rounded-xl border border-white/10 mt-4">
                  <p className="font-mono text-sm">A → <span className="text-[#f59e0b]">Q</span></p>
                  <p className="font-mono text-sm">B → <span className="text-[#f59e0b]">W</span></p>
                  <p className="font-mono text-sm">C → <span className="text-[#f59e0b]">E</span></p>
                </div>
                <p>This is much harder to crack than Caesar because the letters are completely mixed up!</p>
              </>
            )}

            {algorithm === 'Transposition' && (
              <>
                <p className="text-lg text-white font-bold">Imagine writing on a grid, then reading it wrong.</p>
                <p>You don't change the letters themselves, you just <strong>scramble the order</strong>.</p>
                <p>You write your message left-to-right in a grid of {transKey} columns. Then, to encrypt it, you read it top-to-bottom (down the columns).</p>
                <div className="bg-black/40 p-4 rounded-xl border border-white/10 mt-4 text-center">
                  <p className="font-mono text-sm text-[#00C8F0]">Write: Rows</p>
                  <ArrowRight className="w-4 h-4 rotate-90 mx-auto my-1 text-white/50" />
                  <p className="font-mono text-sm text-[#f59e0b]">Read: Columns</p>
                </div>
                <p>To decrypt, your friend just draws the grid and reads it left-to-right again!</p>
              </>
            )}

            {(algorithm.includes('AES')) && (
              <>
                <p className="text-lg text-white font-bold">Imagine a high-tech digital blender.</p>
                <p>Instead of moving letters one by one, AES takes chunks of your text (blocks of 16 characters).</p>
                <p>It chops them up, mixes them with a massive 256-bit Password (the Key), and runs them through 14 rounds of complex math.</p>
                <div className="bg-black/40 p-4 rounded-xl border border-white/10 mt-4">
                  <p className="text-xs text-white/70">Because it uses <strong>{algorithm.split('-')[2]}</strong> mode, it also uses an <strong>IV (Initialization Vector)</strong> to ensure identical text never produces identical ciphertext.</p>
                </div>
                <p>The result is a giant block of unreadable Hex numbers!</p>
              </>
            )}

            {algorithm === 'RSA' && (
              <>
                <p className="text-lg text-white font-bold">Imagine a locked mailbox with a slot.</p>
                <p>RSA uses <strong>Two Keys</strong>. The <strong>Public Key</strong> is like the slot on the mailbox. Anyone can push a letter in (Encrypt).</p>
                <p>But once it's inside, only the <strong>Private Key</strong> (the mailbox owner) can open the door and take the letter out (Decrypt).</p>
                <div className="bg-black/40 p-4 rounded-xl border border-white/10 mt-4">
                  <p className="font-mono text-sm text-green-400">Public Key → Encrypts</p>
                  <p className="font-mono text-sm text-red-400">Private Key → Decrypts</p>
                </div>
                <p>Even if a hacker steals the Public Key, they still can't read the message!</p>
              </>
            )}
          </div>

          {/* RIGHT SIDE: TECHNICAL STEPS */}
          <div className="space-y-4 text-white/80 leading-relaxed">
            <p className="text-lg text-white font-bold">What the computer does:</p>
            <div className="space-y-3">
              
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#7226FF]/20 flex items-center justify-center shrink-0 border border-[#7226FF]/50">
                  <span className="text-[#D8B4FE] font-bold text-sm">1</span>
                </div>
                <p className="text-sm"><strong>Input:</strong> Takes your plaintext message.</p>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#7226FF]/20 flex items-center justify-center shrink-0 border border-[#7226FF]/50">
                  <span className="text-[#D8B4FE] font-bold text-sm">2</span>
                </div>
                <p className="text-sm">
                  <strong>Process:</strong> 
                  {algorithm === 'Caesar' && ` Converts to ASCII, adds ${shift} to each letter's index, wraps around at Z.`}
                  {algorithm === 'Substitution' && ` Loops through your text, finds each letter in the normal alphabet, and swaps it with the matching letter in your Key.`}
                  {algorithm === 'Transposition' && ` Saves the text into a 2D array (Grid) and extracts the string column by column.`}
                  {algorithm.includes('AES') && ` Uses PBKDF2 to turn your password into a 256-bit cryptographic key, then encrypts the text into Hex using the IV.`}
                  {algorithm === 'RSA' && ` Converts text to BigInt, applies RSA-OAEP padding, and runs it through the Public Key math.`}
                </p>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#7226FF]/20 flex items-center justify-center shrink-0 border border-[#7226FF]/50">
                  <span className="text-[#D8B4FE] font-bold text-sm">3</span>
                </div>
                <p className="text-sm"><strong>Output:</strong> Returns the scrambled ciphertext safely.</p>
              </div>

            </div>
            <div className="mt-6 p-4 bg-[#00C8F0]/10 border border-[#00C8F0]/30 rounded-xl">
              <p className="text-sm text-[#00C8F0] font-bold">Is it secure?</p>
              <p className="text-xs text-[#D8B4FE] mt-1">
                {category === 'classical' ? "Classical ciphers are great for learning, but modern computers can crack them in milliseconds using frequency analysis." : "Modern algorithms like AES and RSA are used by banks, militaries, and the entire internet. They are practically impossible to brute-force."}
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}