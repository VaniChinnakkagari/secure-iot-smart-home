export function simulateSlidingWindow(req, res) {
  const { windowSize = 4, totalFrames = 10 } = req.body;
  
  if (windowSize < 1 || windowSize > 8 || totalFrames < 1) {
    return res.status(400).json({ success: false, error: { message: "Invalid parameters" } });
  }

  const steps = [];
  let base = 0;
  let nextSeqNum = 0;

  // Simulate the transmission
  while (base < totalFrames) {
    let stepLog = {
      base,
      nextSeqNum,
      senderWindow: [],
      receiverWindow: [],
      event: "",
      ackReceived: null
    };

    // 1. Send frames up to window size
    while (nextSeqNum < base + windowSize && nextSeqNum < totalFrames) {
      stepLog.senderWindow.push(nextSeqNum);
      nextSeqNum++;
    }
    
    // 2. Receiver gets the frames
    for (let i = base; i < nextSeqNum; i++) {
      stepLog.receiverWindow.push(i);
    }

    stepLog.event = `Sent frames up to SEQ ${nextSeqNum - 1}`;
    steps.push({ ...stepLog });

    // 3. Simulate receiving an ACK for the first frame in the window
    stepLog.ackReceived = base;
    stepLog.event = `Received ACK for SEQ ${base}. Window slides.`;
    base++;
    
    // Clear windows for the next visual step
    stepLog.senderWindow = [];
    stepLog.receiverWindow = [];
    steps.push({ ...stepLog });
  }

  res.json({
    success: true,
    data: {
      windowSize,
      totalFrames,
      steps
    }
  });
}