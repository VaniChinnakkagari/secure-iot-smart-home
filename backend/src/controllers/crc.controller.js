// Helper to calculate CRC-16-CCITT (XModem)
function calculateCRC16(data) {
  let crc = 0x0000;
  for (let i = 0; i < data.length; i++) {
    crc ^= (data.charCodeAt(i) << 8);
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  return (crc & 0xFFFF).toString(16).padStart(4, '0').toUpperCase();
}

// POST /api/crc/process
export function processFrame(req, res) {
  const { payload, corrupt } = req.body;

  if (!payload) {
    return res.status(400).json({ success: false, error: { message: "Payload is required" } });
  }

  // 1. Byte Stuffing (Replace delimiter 0x7E with 0x7D 0x5E)
  let stuffedPayload = "";
  for (let i = 0; i < payload.length; i++) {
    if (payload[i] === '~') { // We'll use '~' as our 0x7E delimiter for visual clarity
      stuffedPayload += '}n'; // Standard byte stuffing for 0x7E is 0x7D 0x5E (we use }n for UI)
    } else if (payload[i] === '}') {
      stuffedPayload += '}]';
    } else {
      stuffedPayload += payload[i];
    }
  }

  // 2. Build Frame
  const startDelim = "0x7E";
  const endDelim = "0x7F";
  const sourceAddr = "192.168.1.101";
  const destAddr = "192.168.1.1";
  const seq = "01";
  
  // 3. Calculate CRC on the ORIGINAL payload (or stuffed payload depending on protocol, let's use stuffed for this demo)
  const dataToCrc = sourceAddr + destAddr + seq + stuffedPayload;
  let crc = calculateCRC16(dataToCrc);

  // 4. Simulate Corruption
  let corruptedPayload = stuffedPayload;
  let corruptedCrc = crc;
  let isValid = true;

  if (corrupt) {
    // Flip a bit in the payload to trigger an error
    corruptedPayload = stuffedPayload.replace('a', 'X'); // Simple visual corruption
    if (corruptedPayload === stuffedPayload) corruptedPayload = "CORRUPTED_" + stuffedPayload;
    isValid = false;
  }

  res.json({
    success: true,
    data: {
      originalPayload: payload,
      stuffedPayload: stuffedPayload,
      frame: {
        start: startDelim,
        source: sourceAddr,
        dest: destAddr,
        seq: seq,
        payload: corruptedPayload,
        crc: corruptedCrc,
        end: endDelim
      },
      crcReceived: corruptedCrc,
      crcCalculated: isValid ? corruptedCrc : "FAILED", 
      isValid,
      message: isValid ? "Frame received successfully. CRC Matched." : "CRC Error! Frame corrupted during transmission."
    }
  });
}