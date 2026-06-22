const mongoose = require('mongoose');

const mongoUri = 'mongodb://localhost:27017/trimora';

const bookingSchema = new mongoose.Schema({
  tokenNumber: Number,
  remainingWait: Number,
  initialWait: Number,
  servicesDuration: Number,
  travelTime: Number,
  mobile: String,
  timestamp: String,
  bookingTimeMs: Number,
  dateString: String,
  salonId: String,
  salonName: String,
  barberName: String,
  servicesIds: [String],
  servicesList: [String],
  status: String,
  isEmergency: Boolean,
  price: Number
});

const queueGapSchema = new mongoose.Schema({
  id: String,
  salonId: String,
  barberName: String,
  duration: Number,
  bookingTimeMs: Number
});

const Booking = mongoose.model('Booking', bookingSchema);
const QueueGap = mongoose.model('QueueGap', queueGapSchema);

async function main() {
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");

  const bookings = await Booking.find({ status: 'active' }).sort({ bookingTimeMs: 1 });
  console.log("\n--- Active Bookings ---");
  bookings.forEach(b => {
    console.log(`Token #${b.tokenNumber} | Barber: ${b.barberName} | Status: ${b.status} | remainingWait: ${b.remainingWait} | servicesDuration: ${b.servicesDuration} | bookingTimeMs: ${b.bookingTimeMs} (${new Date(b.bookingTimeMs).toLocaleTimeString()})`);
  });

  const gaps = await QueueGap.find();
  console.log("\n--- Queue Gaps ---");
  gaps.forEach(g => {
    console.log(`Gap ID: ${g.id} | Barber: ${g.barberName} | duration: ${g.duration} | bookingTimeMs: ${g.bookingTimeMs}`);
  });

  // Let's run the timeline calculation for Vikram Singh
  const barberName = "Vikram Singh";
  const salonId = "salon_royal";
  const queue = bookings.filter(t => t.salonId === salonId && t.barberName === barberName);
  const barberGaps = gaps.filter(g => g.salonId === salonId && g.barberName === barberName);
  const timeline = [...queue, ...barberGaps].sort((a, b) => (a.bookingTimeMs || 0) - (b.bookingTimeMs || 0));

  console.log(`\n--- Timeline for ${barberName} ---`);
  timeline.forEach((item, idx) => {
    const isToken = !!item.tokenNumber;
    console.log(`Pos ${idx}: ${isToken ? `Token #${item.tokenNumber}` : `Gap`} | bookingTimeMs: ${item.bookingTimeMs} | remainingWait/duration: ${isToken ? item.remainingWait : item.duration} | servicesDuration: ${isToken ? item.servicesDuration : 'N/A'}`);
  });

  console.log("\n--- Wait time calculation like client-side renderTrackerUI ---");
  timeline.forEach((item, idx) => {
    if (!item.tokenNumber) return;
    let waitTime = item.remainingWait;
    let calculationSteps = [];
    if (idx > 0) {
      const first = timeline[0];
      waitTime = first.tokenNumber ? first.remainingWait : first.duration;
      calculationSteps.push(first.tokenNumber ? `FirstTokenRemaining(${first.remainingWait})` : `FirstGapDuration(${first.duration})`);
      for (let i = 1; i < idx; i++) {
        const nextItem = timeline[i];
        waitTime += nextItem.tokenNumber ? nextItem.servicesDuration : nextItem.duration;
        calculationSteps.push(nextItem.tokenNumber ? `TokenServicesDuration(${nextItem.servicesDuration})` : `GapDuration(${nextItem.duration})`);
      }
    } else {
      calculationSteps.push(`HeadTokenRemaining(${item.remainingWait})`);
    }
    console.log(`Token #${item.tokenNumber} | Calculated WaitTime: ${waitTime} mins | Steps: ${calculationSteps.join(' + ')}`);
  });

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  mongoose.disconnect();
});
