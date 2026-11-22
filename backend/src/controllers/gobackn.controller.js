export function simulateGoBackN(req, res) {
  let { windowSize = 4, totalFrames = 8, dropFrame = 2 } = req.body;

  // Safety check: Convert to numbers and ensure valid ranges
  windowSize = Number(windowSize);
  totalFrames = Number(totalFrames);
  dropFrame = Number(dropFrame);

  if (windowSize < 1 || totalFrames < 1) {
    return res.status(400).json({ success: false, error: { message: "Invalid parameters" } });
  }

  // Prevent crash: Drop frame cannot be larger than total frames
  if (dropFrame >= totalFrames) {
    dropFrame = totalFrames - 1; 
  }

  const steps = [];
  let base = 0;
  let nextSeqNum = 0;
  let expectedFrame = 0;

  // Add a max loop limit to absolutely prevent infinite loops
  let loopSafety = 0; 

  while (base < totalFrames && loopSafety < 50) {
    loopSafety++;
    
    let senderWindow = [];
    let receiverWindow = [];
    
    // 1. Sender sends frames up to window size
    while (nextSeqNum < base + windowSize && nextSeqNum < totalFrames) {
      senderWindow.push(nextSeqNum);
      nextSeqNum++;
    }

    // 2. Network simulation
    let lost = false;
    let ackToReceive = null;

    for (let i = base; i < senderWindow.length + base; i++) {
      if (i === dropFrame) {
        lost = true;
        break; // Packet lost! Stop processing here.
      } else {
        receiverWindow.push(i);
        expectedFrame = i + 1;
      }
    }

    if (lost) {
      // Record the timeout step
      steps.push({
        base,
        nextSeqNum,
        senderWindow: [...senderWindow],
        receiverWindow: [...receiverWindow],
        event: `Timeout! Frame SEQ ${dropFrame} was lost. Sender will Go-Back to SEQ ${base}.`,
        type: "timeout"
      });
      
      // Go-Back-N logic: reset nextSeqNum to base
      nextSeqNum = base; 
      
    } else {
      // Everything was received successfully. Send ACK.
      steps.push({
        base,
        nextSeqNum,
        senderWindow: [...senderWindow],
        receiverWindow: [...receiverWindow],
        event: `Frames ${base} to ${base + senderWindow.length - 1} received. Sent ACK ${expectedFrame}.`,
        type: "ack",
        ack: expectedFrame
      });

      // Slide the window forward
      base = expectedFrame;
    }
  }

  res.json({
    success: true,
    data: {
      windowSize,
      totalFrames,
      dropFrame,
      steps
    }
  });
}