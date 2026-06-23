const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
require('dotenv').config();
const app=express();
const PORT=process.env.PORT||2000;
app.use(cors());
app.use(express.json({limit:'50mb'}));
app.use(express.urlencoded({limit:'50mb',extended:true}));
app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.url}`, JSON.stringify(req.body));
  next();
});
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});
app.use(express.static(__dirname));
const mongoURI=process.env.MONGODB_URI||'mongodb://localhost:27017/trimora';
mongoose.connect(mongoURI).catch(err=>console.error(err));
const barberSchema=new mongoose.Schema({name:String,rating:Number,experience:Number,onLeave:Boolean});
const salonSchema=new mongoose.Schema({id:{type:String,unique:true},name:String,address:String,coords:[Number],status:String,offer:String,barbers:[barberSchema],mobile:String,email:String,image:String,comboActive:{type:Boolean,default:false},comboTriggerServiceIds:[String],comboRewardServiceId:String,adBannerUrl:{type:String,default:""},lastMilestoneClaimed:{type:Number,default:0},adExpiresAt:{type:Date,default:null},type:{type:String,default:'salon'}});
const ownerSchema=new mongoose.Schema({salonId:String,salonName:String,email:{type:String,unique:true},mobile:{type:String,unique:true},password:String,ownerName:String});
const serviceSchema=new mongoose.Schema({salonId:String,id:String,nameEn:String,nameHi:String,icon:String,times:{type:Map,of:Number},price:{type:Number,default:0}});
const bookingSchema=new mongoose.Schema({tokenNumber:Number,remainingWait:Number,initialWait:Number,servicesDuration:Number,travelTime:Number,mobile:String,timestamp:String,bookingTimeMs:Number,dateString:String,salonId:String,salonName:String,barberName:String,servicesIds:[String],servicesList:[String],status:String,isEmergency:Boolean,price:Number,feedback:{salonRating:Number,barberRating:Number,comment:String}});
const queueGapSchema=new mongoose.Schema({id:{type:String,unique:true},salonId:String,barberName:String,duration:Number,bookingTimeMs:Number});
const Salon=mongoose.model('Salon',salonSchema);
const Owner=mongoose.model('Owner',ownerSchema);
const Service=mongoose.model('Service',serviceSchema);
const Booking=mongoose.model('Booking',bookingSchema);
const QueueGap=mongoose.model('QueueGap',queueGapSchema);
const tempOwnerSchema=new mongoose.Schema({tempId:String,salonId:String,salonName:String,email:String,mobile:String,password:String,ownerName:String,address:String,coords:[Number],otp:String,image:String,type:{type:String,default:'salon'},createdAt:{type:Date,expires:60,default:Date.now}});
const TempOwner=mongoose.model('TempOwner',tempOwnerSchema);
const customerSchema=new mongoose.Schema({name:String,email:{type:String,unique:true},mobile:{type:String,unique:true},password:String,resetOtp:String,resetOtpExpires:Date});
const Customer=mongoose.model('Customer',customerSchema);
const defaultSalons=[{id:"salon_vogue",name:"Vogue Studio",address:"12, PLA Market, Hisar, Haryana",coords:[29.1582,75.7225],status:"busy",offer:"Flat 20% off on Hair Coloring & Styling!",barbers:[{name:"Rajiv Sharma",rating:4.8,experience:8,onLeave:false},{name:"Amit Verma",rating:4.6,experience:5,onLeave:false}],mobile:"8888888888",email:"vogue@trimora.com",image:"/images/salon_vogue.png",comboActive:true,comboTriggerServiceIds:["haircut","beard"],comboRewardServiceId:"facewash",adBannerUrl:"",lastMilestoneClaimed:0,adExpiresAt:null,type:"unisex"},{id:"salon_royal",name:"The Royal Groom",address:"G-4, Sector 13, Hisar, Haryana",coords:[29.1528,75.7145],status:"free",offer:"20% OFF on Hair Color",barbers:[{name:"Vikram Singh",rating:4.9,experience:10,onLeave:false},{name:"Sandeep Patel",rating:4.5,experience:4,onLeave:false}],mobile:"7777777777",email:"royal@trimora.com",image:"/images/salon_royal.png",comboActive:true,comboTriggerServiceIds:["haircut","beard"],comboRewardServiceId:"facewash",adBannerUrl:"",lastMilestoneClaimed:0,adExpiresAt:null,type:"salon"},{id:"salon_classic",name:"Classic Cuts",address:"45, Rajguru Market, Hisar, Haryana",coords:[29.1481,75.7251],status:"full",offer:"Students Special: Haircut + Beard for just ₹250!",barbers:[{name:"Deepak Chouhan",rating:4.7,experience:6,onLeave:false},{name:"Rahul Mehta",rating:4.4,experience:3,onLeave:false}],mobile:"6666666666",email:"classic@trimora.com",image:"/images/salon_classic.png",comboActive:false,comboTriggerServiceIds:[],comboRewardServiceId:"",adBannerUrl:"",lastMilestoneClaimed:0,adExpiresAt:null,type:"salon"},{id:"salon_glow",name:"Glow & Style",address:"88, Jindal Chowk, Hisar, Haryana",coords:[29.1624,75.7208],status:"free",offer:"Get a complimentary Face Wash on any service above ₹500!",barbers:[{name:"Karan Joshi",rating:4.6,experience:5,onLeave:false},{name:"Vijay Sen",rating:4.3,experience:4,onLeave:false}],mobile:"5555555555",email:"glow@trimora.com",image:"/images/salon_glow.png",comboActive:false,comboTriggerServiceIds:[],comboRewardServiceId:"",adBannerUrl:"",lastMilestoneClaimed:0,adExpiresAt:null,type:"salon"},{id:"salon_bella",name:"Bella Beauty Parlour & Spa",address:"Shop 5, Sector 14, Hisar, Haryana",coords:[29.1550,75.7280],status:"free",offer:"Get a FREE Hair Spa on any service above ₹499! 🌸",barbers:[{name:"Pooja Sharma",rating:4.9,experience:7,onLeave:false},{name:"Neha Kapoor",rating:4.7,experience:5,onLeave:false}],mobile:"9999999999",email:"bella@trimora.com",image:"/images/salon_glow.png",comboActive:false,comboTriggerServiceIds:[],comboRewardServiceId:"",adBannerUrl:"",lastMilestoneClaimed:0,adExpiresAt:null,type:"beauty parlour"}];
const defaultOwners=[{salonId:"salon_vogue",salonName:"Vogue Studio",email:"vogue@trimora.com",mobile:"8888888888",password:"123456",ownerName:"Rajiv Sharma"},{salonId:"salon_royal",salonName:"The Royal Groom",email:"royal@trimora.com",mobile:"7777777777",password:"123456",ownerName:"Vikram Singh"},{salonId:"salon_classic",salonName:"Classic Cuts",email:"classic@trimora.com",mobile:"6666666666",password:"123456",ownerName:"Deepak Chouhan"},{salonId:"salon_glow",salonName:"Glow & Style",email:"glow@trimora.com",mobile:"5555555555",password:"123456",ownerName:"Karan Joshi"},{salonId:"salon_bella",salonName:"Bella Beauty Parlour & Spa",email:"bella@trimora.com",mobile:"9999999999",password:"123456",ownerName:"Pooja Sharma"}];
const defaultServices=[{salonId:"salon_vogue",id:"haircut",nameEn:"Haircut",nameHi:"बाल काटना",icon:"fa-scissors",times:{"Rajiv Sharma":25,"Amit Verma":20},price:150},{salonId:"salon_vogue",id:"beard",nameEn:"Beard Grooming",nameHi:"दाढ़ी बनाना",icon:"fa-user-tie",times:{"Rajiv Sharma":15,"Amit Verma":10},price:80},{salonId:"salon_vogue",id:"facewash",nameEn:"Face Wash",nameHi:"चेहरा धोना",icon:"fa-soap",times:{"Rajiv Sharma":10,"Amit Verma":10},price:70},{salonId:"salon_vogue",id:"headmassage",nameEn:"Head Massage",nameHi:"सिर मालिश",icon:"fa-spa",times:{"Rajiv Sharma":15,"Amit Verma":12},price:120},{salonId:"salon_vogue",id:"haircolor",nameEn:"Hair Color",nameHi:"बालों का रंग",icon:"fa-paint-brush",times:{"Rajiv Sharma":40,"Amit Verma":35},price:300},{salonId:"salon_vogue",id:"scrub",nameEn:"Face Scrub",nameHi:"स्क्रब",icon:"fa-wind",times:{"Rajiv Sharma":20,"Amit Verma":15},price:150},{salonId:"salon_vogue",id:"massage",nameEn:"Full Massage",nameHi:"मालिश",icon:"fa-hot-tub-person",times:{"Rajiv Sharma":30,"Amit Verma":25},price:400},{salonId:"salon_vogue",id:"threading",nameEn:"Threading",nameHi:"थ्रेडिंग",icon:"fa-eye-dropper",times:{"Rajiv Sharma":10,"Amit Verma":12},price:50},{salonId:"salon_royal",id:"haircut",nameEn:"Haircut",nameHi:"बाल काटना",icon:"fa-scissors",times:{"Vikram Singh":30,"Sandeep Patel":22},price:180},{salonId:"salon_royal",id:"beard",nameEn:"Beard Grooming",nameHi:"दाढ़ी बनाना",icon:"fa-user-tie",times:{"Vikram Singh":20,"Sandeep Patel":12},price:100},{salonId:"salon_royal",id:"facewash",nameEn:"Face Wash",nameHi:"चेहरा धोना",icon:"fa-soap",times:{"Vikram Singh":15,"Sandeep Patel":10},price:90},{salonId:"salon_royal",id:"headmassage",nameEn:"Head Massage",nameHi:"सिर मालिश",icon:"fa-spa",times:{"Vikram Singh":20,"Sandeep Patel":15},price:150},{salonId:"salon_classic",id:"haircut",nameEn:"Haircut",nameHi:"बाल काटना",icon:"fa-scissors",times:{"Deepak Chouhan":18,"Rahul Mehta":25},price:100},{salonId:"salon_classic",id:"beard",nameEn:"Beard Grooming",nameHi:"दाढ़ी बनाना",icon:"fa-user-tie",times:{"Deepak Chouhan":12,"Rahul Mehta":15},price:60},{salonId:"salon_glow",id:"haircut",nameEn:"Haircut",nameHi:"बाल काटना",icon:"fa-scissors",times:{"Karan Joshi":20,"Vijay Sen":25},price:120},{salonId:"salon_glow",id:"beard",nameEn:"Beard Grooming",nameHi:"दाढ़ी बनाना",icon:"fa-user-tie",times:{"Karan Joshi":15,"Vijay Sen":15},price:70},{salonId:"salon_glow",id:"facewash",nameEn:"Face Wash",nameHi:"चेहरा धोना",icon:"fa-soap",times:{"Karan Joshi":10,"Vijay Sen":12},price:80},{salonId:"salon_glow",id:"haircolor",nameEn:"Hair Color",nameHi:"बालों का रंग",icon:"fa-paint-brush",times:{"Karan Joshi":30,"Vijay Sen":35},price:250},{salonId:"salon_bella",id:"haircut",nameEn:"Haircut & Styling",nameHi:"हेयरकट और स्टाइलिंग",icon:"fa-scissors",times:{"Pooja Sharma":30,"Neha Kapoor":25},price:200},{salonId:"salon_bella",id:"threading",nameEn:"Eyebrow Threading",nameHi:"थ्रेडिंग",icon:"fa-eye-dropper",times:{"Pooja Sharma":10,"Neha Kapoor":8},price:40},{salonId:"salon_bella",id:"facial",nameEn:"Fruit Facial",nameHi:"फ्रूट फेशियल",icon:"fa-spa",times:{"Pooja Sharma":40,"Neha Kapoor":35},price:350},{salonId:"salon_bella",id:"waxing",nameEn:"Full Arms Waxing",nameHi:"वैक्सिंग",icon:"fa-wind",times:{"Pooja Sharma":25,"Neha Kapoor":20},price:250},{salonId:"salon_bella",id:"makeup",nameEn:"Party Makeup",nameHi:"पार्टी मेकअप",icon:"fa-wand-magic-sparkles",times:{"Pooja Sharma":45,"Neha Kapoor":45},price:800}];
const seedDB=async()=>{
  try{
    const hasBella=await Salon.findOne({id:"salon_bella"});
    if(!hasBella){
      await Owner.deleteMany({});
      await Salon.deleteMany({});
      await Service.deleteMany({});
      await Booking.deleteMany({});
      await QueueGap.deleteMany({});
      await Salon.insertMany(defaultSalons);
      await Owner.insertMany(defaultOwners);
      await Service.insertMany(defaultServices);
    }
    
    // Seed completed bookings for Gold, Silver, Bronze ad tiers demonstration
    const completedCount = await Booking.countDocuments({status:'completed'});
    if(completedCount === 0){
      const demoBookings = [];
      const nowMs = Date.now();
      
      // 105 completed bookings for Vogue Studio -> Gold Tier
      // Distributed over past 5 days (1 to 5 days ago), 21 bookings per day
      for (let day = 1; day <= 5; day++) {
        const dateMs = nowMs - (day * 24 * 60 * 60 * 1000);
        const dateObj = new Date(dateMs);
        const dateStr = dateObj.toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' });
        for (let t = 1; t <= 21; t++) {
          const hour = 9 + Math.floor(t / 2);
          const min = (t % 2) * 30;
          const timeStr = `${hour}:${min === 0 ? '00' : min} ${hour >= 12 ? 'PM' : 'AM'}`;
          demoBookings.push({
            tokenNumber: t,
            remainingWait: 0,
            initialWait: 0,
            servicesDuration: 15,
            travelTime: 10,
            mobile: "9999999999",
            timestamp: timeStr,
            bookingTimeMs: dateMs + (t * 30 * 60 * 1000),
            dateString: dateStr,
            salonId: "salon_vogue",
            salonName: "Vogue Studio",
            barberName: "Rajiv Sharma",
            servicesIds: ["srv_vogue_1"],
            servicesList: ["Haircut"],
            status: "completed",
            isEmergency: false,
            price: 150
          });
        }
      }
      
      // 90 completed bookings for Classic Cuts -> Silver Tier
      // Distributed over past 5 days (1 to 5 days ago), 18 bookings per day
      for (let day = 1; day <= 5; day++) {
        const dateMs = nowMs - (day * 24 * 60 * 60 * 1000);
        const dateObj = new Date(dateMs);
        const dateStr = dateObj.toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' });
        for (let t = 1; t <= 18; t++) {
          const hour = 9 + Math.floor(t / 2);
          const min = (t % 2) * 30;
          const timeStr = `${hour}:${min === 0 ? '00' : min} ${hour >= 12 ? 'PM' : 'AM'}`;
          demoBookings.push({
            tokenNumber: t,
            remainingWait: 0,
            initialWait: 0,
            servicesDuration: 15,
            travelTime: 10,
            mobile: "8888888888",
            timestamp: timeStr,
            bookingTimeMs: dateMs + (t * 30 * 60 * 1000),
            dateString: dateStr,
            salonId: "salon_classic",
            salonName: "Classic Cuts",
            barberName: "Vikram Singh",
            servicesIds: ["srv_classic_1"],
            servicesList: ["Haircut"],
            status: "completed",
            isEmergency: false,
            price: 120
          });
        }
      }
      
      // 80 completed bookings for The Royal Groom -> Bronze Tier
      // Distributed over past 5 days (1 to 5 days ago), 16 bookings per day
      for (let day = 1; day <= 5; day++) {
        const dateMs = nowMs - (day * 24 * 60 * 60 * 1000);
        const dateObj = new Date(dateMs);
        const dateStr = dateObj.toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' });
        for (let t = 1; t <= 16; t++) {
          const hour = 9 + Math.floor(t / 2);
          const min = (t % 2) * 30;
          const timeStr = `${hour}:${min === 0 ? '00' : min} ${hour >= 12 ? 'PM' : 'AM'}`;
          demoBookings.push({
            tokenNumber: t,
            remainingWait: 0,
            initialWait: 0,
            servicesDuration: 15,
            travelTime: 10,
            mobile: "7777777777",
            timestamp: timeStr,
            bookingTimeMs: dateMs + (t * 30 * 60 * 1000),
            dateString: dateStr,
            salonId: "salon_royal",
            salonName: "The Royal Groom",
            barberName: "Rajiv Sharma",
            servicesIds: ["srv_royal_1"],
            servicesList: ["Haircut"],
            status: "completed",
            isEmergency: false,
            price: 180
          });
        }
      }
      
      await Booking.insertMany(demoBookings);
      console.log("Seeded completed bookings for testing ad tiers");
    }
  }catch(err){
    console.error(err);
  }
};
seedDB();
const checkSalonAdMilestone=async(salonId)=>{try{const salon=await Salon.findOne({id:salonId});if(!salon)return;const completedCount=await Booking.countDocuments({salonId,status:'completed'});const nextMilestone=(salon.lastMilestoneClaimed+1)*100;if(completedCount>=nextMilestone){const milestonesCrossed=Math.floor(completedCount/100);const newMilestone=milestonesCrossed*100;if(newMilestone>salon.lastMilestoneClaimed){const standardAdDurationMs=7*24*60*60*1000;const additionalAdTime=((newMilestone-salon.lastMilestoneClaimed)/100)*standardAdDurationMs;let newExpiresAt=salon.adExpiresAt&&salon.adExpiresAt>Date.now()?new Date(salon.adExpiresAt.getTime()+additionalAdTime):new Date(Date.now()+additionalAdTime);salon.adExpiresAt=newExpiresAt;salon.lastMilestoneClaimed=newMilestone;await salon.save();console.log(`[AD PROMOTION UNLOCKED] Salon: ${salon.name}, Milestone: ${newMilestone}, Expires: ${newExpiresAt}`)}}}catch(err){console.error("Error checking milestone:",err)}};
const enrichSalonWithAdInfo=async(salon)=>{if(!salon)return null;const s=salon.toObject?salon.toObject():JSON.parse(JSON.stringify(salon));s.completedCount=await Booking.countDocuments({salonId:s.id,status:'completed'});const sevenDaysAgo=Date.now()-7*24*60*60*1000;s.weeklyCompletedCount=await Booking.countDocuments({salonId:s.id,status:'completed',bookingTimeMs:{$gte:sevenDaysAgo}});if(s.weeklyCompletedCount>=100){s.adTier='gold'}else if(s.weeklyCompletedCount>=90){s.adTier='silver'}else if(s.weeklyCompletedCount>=80){s.adTier='bronze'}else{s.adTier=null}return s};
app.get('/api/salons',async(req,res)=>{try{const salons=await Salon.find();const enrichedSalons=[];for(const s of salons){enrichedSalons.push(await enrichSalonWithAdInfo(s))}res.json(enrichedSalons)}catch(err){res.status(500).json({error:err.message})}});
app.post('/api/salons/config',async(req,res)=>{try{const{salonId,offer,status,comboActive,comboTriggerServiceIds,comboRewardServiceId,adBannerUrl}=req.body;const salon=await Salon.findOneAndUpdate({id:salonId},{offer,status,comboActive,comboTriggerServiceIds,comboRewardServiceId,adBannerUrl},{new:true});if(salon){await Booking.updateMany({salonId,status:'active'},{offer});const enriched=await enrichSalonWithAdInfo(salon);res.json(enriched)}else{res.status(404).json({error:'Salon not found'})}}catch(err){res.status(500).json({error:err.message})}});
app.post('/api/salons/barbers',async(req,res)=>{try{const{salonId,name,mobile,experience}=req.body;const salon=await Salon.findOne({id:salonId});if(!salon)return res.status(404).json({error:'Salon not found'});if(salon.barbers.some(b=>b.name.toLowerCase()===name.toLowerCase()))return res.status(400).json({error:'Barber already exists'});salon.barbers.push({name,mobile,rating:4.5,experience,onLeave:false});await salon.save();await Service.updateMany({salonId},{$set:{[`times.${name}`]:20}});const enriched=await enrichSalonWithAdInfo(salon);res.json(enriched)}catch(err){res.status(500).json({error:err.message})}});
app.post('/api/salons/barbers/leave',async(req,res)=>{try{const{salonId,barberName}=req.body;const salon=await Salon.findOne({id:salonId});if(!salon)return res.status(404).json({error:'Salon not found'});const barber=salon.barbers.find(b=>b.name===barberName);if(!barber)return res.status(404).json({error:'Barber not found'});barber.onLeave=!barber.onLeave;await salon.save();const enriched=await enrichSalonWithAdInfo(salon);res.json(enriched)}catch(err){res.status(500).json({error:err.message})}});
app.delete('/api/salons/barbers',async(req,res)=>{try{const{salonId,barberName}=req.body;const salon=await Salon.findOne({id:salonId});if(!salon)return res.status(404).json({error:'Salon not found'});salon.barbers=salon.barbers.filter(b=>b.name!==barberName);await salon.save();await Service.updateMany({salonId},{$unset:{[`times.${barberName}`]:""}});const enriched=await enrichSalonWithAdInfo(salon);res.json(enriched)}catch(err){res.status(500).json({error:err.message})}});
app.get('/api/services/:salonId',async(req,res)=>{try{const services=await Service.find({salonId:req.params.salonId});res.json(services)}catch(err){res.status(500).json({error:err.message})}});
app.post('/api/salons/services',async(req,res)=>{try{const{salonId,id,nameEn,nameHi,icon,times,price}=req.body;const exists=await Service.findOne({salonId,id});if(exists)return res.status(400).json({error:'Service already exists'});const newSrv=new Service({salonId,id,nameEn,nameHi,icon,times,price});await newSrv.save();res.json(newSrv)}catch(err){res.status(500).json({error:err.message})}});
app.delete('/api/salons/services',async(req,res)=>{try{const{salonId,srvId}=req.body;await Service.deleteOne({salonId,id:srvId});res.json({success:true})}catch(err){res.status(500).json({error:err.message})}});
app.post('/api/owners/register',async(req,res)=>{try{const{salonId,salonName,mobile,email,password,ownerName,address,coords,image,type}=req.body;const exists=await Owner.findOne({$or:[{mobile},{email}]});if(exists)return res.status(400).json({error:'Owner already registered with this mobile or email'});const tempId='temp_'+Date.now();const otp=Math.floor(100000+Math.random()*900000).toString();const tempOwner=new TempOwner({tempId,salonId,salonName,email,mobile,password,ownerName,address,coords,image,otp,type:type||'salon'});await tempOwner.save();res.json({success:true,tempId,otp})}catch(err){res.status(500).json({error:err.message})}});
app.post('/api/owners/verify-otp',async(req,res)=>{try{const{tempId,otp}=req.body;const tempOwner=await TempOwner.findOne({tempId});if(!tempOwner)return res.status(400).json({error:'OTP session expired or invalid. Please register again.'});if(tempOwner.otp!==otp)return res.status(400).json({error:'Incorrect OTP. Please check the WhatsApp alert and try again.'});const newOwner=new Owner({salonId:tempOwner.salonId,salonName:tempOwner.salonName,mobile:tempOwner.mobile,email:tempOwner.email,password:tempOwner.password,ownerName:tempOwner.ownerName});await newOwner.save();const newSalon=new Salon({id:tempOwner.salonId,name:tempOwner.salonName,address:tempOwner.address,coords:tempOwner.coords,status:'free',offer:'Flat 10% off on first visit!',barbers:[],mobile:tempOwner.mobile,email:tempOwner.email,image:tempOwner.image||'/images/default_salon.png',type:tempOwner.type||'salon'});await newSalon.save();await TempOwner.deleteOne({tempId});res.json({success:true})}catch(err){res.status(500).json({error:err.message})}});
app.post('/api/salons/:salonId/approve',async(req,res)=>{try{const salon=await Salon.findOneAndUpdate({id:req.params.salonId},{status:'free'},{new:true});if(salon){const enriched=await enrichSalonWithAdInfo(salon);res.json({success:true,salon:enriched})}else{res.status(404).json({error:'Salon not found'})}}catch(err){res.status(500).json({error:err.message})}});
app.post('/api/salons/:salonId/reject',async(req,res)=>{try{const salon=await Salon.findOne({id:req.params.salonId});if(!salon)return res.status(404).json({error:'Salon not found'});await Salon.deleteOne({id:req.params.salonId});await Owner.deleteOne({salonId:req.params.salonId});res.json({success:true})}catch(err){res.status(500).json({error:err.message})}});
app.post('/api/owners/login',async(req,res)=>{try{const{identity,password}=req.body;if(identity==='admin'&&password==='000000')return res.json({success:true,superAdmin:true});const owner=await Owner.findOne({$or:[{salonName:new RegExp('^'+identity+'$','i')},{mobile:identity},{email:new RegExp('^'+identity+'$','i')}],password});if(owner){res.json({success:true,superAdmin:false,salonId:owner.salonId,ownerName:owner.ownerName})}else{res.status(401).json({error:'Invalid credentials'})}}catch(err){res.status(500).json({error:err.message})}});
app.get('/api/owners',async(req,res)=>{try{const owners=await Owner.find();res.json(owners)}catch(err){res.status(500).json({error:err.message})}});
app.post('/api/customers/register',async(req,res)=>{try{const{name,mobile,email,password}=req.body;const exists=await Customer.findOne({$or:[{mobile},{email}]});if(exists)return res.status(400).json({error:'Customer already registered with this mobile or email'});const newCustomer=new Customer({name,mobile,email,password});await newCustomer.save();res.json({success:true})}catch(err){res.status(500).json({error:err.message})}});
app.post('/api/customers/login',async(req,res)=>{try{const{identity,password}=req.body;const customer=await Customer.findOne({$or:[{mobile:identity},{email:new RegExp('^'+identity+'$','i')}],password});if(customer){res.json({success:true,customer:{name:customer.name,mobile:customer.mobile,email:customer.email}})}else{res.status(401).json({error:'Invalid credentials'})}}catch(err){res.status(500).json({error:err.message})}});
app.post('/api/customers/forgot-password',async(req,res)=>{try{const{mobile}=req.body;const customer=await Customer.findOne({mobile});if(!customer)return res.status(404).json({error:'Is mobile number se koi customer registered nahi hai.'});const otp=Math.floor(100000+Math.random()*900000).toString();customer.resetOtp=otp;customer.resetOtpExpires=new Date(Date.now()+5*60*1000);await customer.save();res.json({success:true,otp})}catch(err){res.status(500).json({error:err.message})}});
app.post('/api/customers/reset-password',async(req,res)=>{try{const{mobile,otp,newPassword}=req.body;const customer=await Customer.findOne({mobile});if(!customer)return res.status(404).json({error:'Customer not found'});if(!newPassword||newPassword.length<6)return res.status(400).json({error:'Password kam se kam 6 characters ka hona chahiye.'});if(!customer.resetOtp||customer.resetOtp!==otp||!customer.resetOtpExpires||customer.resetOtpExpires<Date.now()){return res.status(400).json({error:'Incorrect ya expired OTP. Kripya check karein aur fir se try karein.'})}customer.password=newPassword;customer.resetOtp=undefined;customer.resetOtpExpires=undefined;await customer.save();res.json({success:true})}catch(err){res.status(500).json({error:err.message})}});
app.get('/api/customers',async(req,res)=>{try{const customers=await Customer.find({},{password:0});res.json(customers)}catch(err){res.status(500).json({error:err.message})}});
app.get('/api/bookings/active',async(req,res)=>{try{const active=await Booking.find({status:'active'});res.json(active)}catch(err){res.status(500).json({error:err.message})}});
app.get('/api/bookings/history',async(req,res)=>{try{const history=await Booking.find();res.json(history)}catch(err){res.status(500).json({error:err.message})}});
app.post('/api/bookings/clear-history',async(req,res)=>{try{await Booking.deleteMany({});res.json({success:true})}catch(err){res.status(500).json({error:err.message})}});
app.get('/api/gaps',async(req,res)=>{try{const gaps=await QueueGap.find();res.json(gaps)}catch(err){res.status(500).json({error:err.message})}});
app.post('/api/gaps/shift',async(req,res)=>{try{const{salonId,barberName}=req.body;await QueueGap.deleteMany({salonId,barberName});res.json({success:true})}catch(err){res.status(500).json({error:err.message})}});
const getBarberTimelineHelper=async(salonId,barberName)=>{const queue=await Booking.find({salonId,barberName,status:'active'});const gaps=await QueueGap.find({salonId,barberName});return[...queue,...gaps].sort((a,b)=>(a.bookingTimeMs||0)-(b.bookingTimeMs||0))};
app.post('/api/bookings',async(req,res)=>{try{const{tokenNumber,remainingWait,initialWait,servicesDuration,travelTime,mobile,timestamp,bookingTimeMs,dateString,salonId,salonName,barberName,servicesIds,servicesList,isEmergency,price}=req.body;const activeBooking=await Booking.findOne({mobile,status:'active'});if(activeBooking)return res.status(400).json({error:'You already have an active booking. Please complete or cancel it before booking again. / आपके पास पहले से ही एक सक्रिय बुकिंग है। कृपया दोबारा बुकिंग करने से पहले इसे पूरा करें या रद्द करें।'});const serverDateString = new Date().toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' });const countToday=await Booking.countDocuments({salonId,dateString:serverDateString,mobile:{$nin:["9999999999","8888888888","7777777777"]}});const finalTokenNumber=countToday+1;const activeGaps=await QueueGap.find({salonId,barberName}).sort({bookingTimeMs:1});let finalBookingTimeMs=bookingTimeMs;let finalWaitToStart=0;let gapConsumedId=null;if(isEmergency){if(activeGaps.length>0){const gap=activeGaps[0];finalBookingTimeMs=gap.bookingTimeMs;gapConsumedId=gap.id;await QueueGap.deleteOne({id:gap.id});const timeline=await getBarberTimelineHelper(salonId,barberName);if(timeline.length>0){const first=timeline[0];finalWaitToStart=first.tokenNumber?first.remainingWait:first.duration;for(let i=1;i<timeline.length;i++){const item=timeline[i];if(item.bookingTimeMs>=finalBookingTimeMs)break;finalWaitToStart+=item.tokenNumber?item.servicesDuration:item.duration}}}else{const queue=await Booking.find({salonId,barberName,status:'active'}).sort({bookingTimeMs:1});if(queue.length>0){finalBookingTimeMs=queue[0].bookingTimeMs+1;finalWaitToStart=queue[0].remainingWait}else{finalBookingTimeMs=Date.now();finalWaitToStart=0}}}else{const timeline=await getBarberTimelineHelper(salonId,barberName);if(timeline.length>0){const first=timeline[0];finalWaitToStart=first.tokenNumber?first.remainingWait:first.duration;for(let i=1;i<timeline.length;i++){const item=timeline[i];finalWaitToStart+=item.tokenNumber?item.servicesDuration:item.duration}}}const finalInitialWait=finalWaitToStart+servicesDuration;const newBooking=new Booking({tokenNumber:finalTokenNumber,remainingWait:servicesDuration,initialWait:finalInitialWait,servicesDuration,travelTime,mobile,timestamp,bookingTimeMs:finalBookingTimeMs,dateString:serverDateString,salonId,salonName,barberName,servicesIds,servicesList,status:'active',isEmergency,price});await newBooking.save();res.json({booking:newBooking,gapConsumedId})}catch(err){res.status(500).json({error:err.message})}});
app.post('/api/bookings/sync',async(req,res)=>{try{const{updatedHistory,updatedGaps}=req.body;const salonsToCheck=new Set();if(updatedHistory&&updatedHistory.length>0){for(const item of updatedHistory){if(item.status==='completed'){const booking=item._id?await Booking.findById(item._id):await Booking.findOne({tokenNumber:item.tokenNumber});if(booking){salonsToCheck.add(booking.salonId)}}if(item._id){await Booking.updateOne({_id:item._id},{remainingWait:item.remainingWait,status:item.status})}else{await Booking.updateOne({tokenNumber:item.tokenNumber,status:'active'},{remainingWait:item.remainingWait,status:item.status})}}}if(updatedGaps){await QueueGap.deleteMany({});if(updatedGaps.length>0){await QueueGap.insertMany(updatedGaps)}}for(const salonId of salonsToCheck){await checkSalonAdMilestone(salonId)}res.json({success:true})}catch(err){res.status(500).json({error:err.message})}});
app.post('/api/bookings/:tokenNumber/simulate-next',async(req,res)=>{try{
  const query = mongoose.Types.ObjectId.isValid(req.params.tokenNumber)
    ? { _id: req.params.tokenNumber, status: 'active' }
    : { tokenNumber: parseInt(req.params.tokenNumber,10), status: 'active' };
  const booking=await Booking.findOneAndUpdate(query,{status:'completed'},{new:true});
  if(booking){await checkSalonAdMilestone(booking.salonId);res.json(booking)}else{res.status(404).json({error:'Booking not found'})}
}catch(err){res.status(500).json({error:err.message})}});
app.post('/api/bookings/:tokenNumber/simulate-adjust',async(req,res)=>{try{
  const mins=parseInt(req.body.minutes,10);
  if(isNaN(mins))return res.status(400).json({error:'Invalid minutes'});
  const query = mongoose.Types.ObjectId.isValid(req.params.tokenNumber)
    ? { _id: req.params.tokenNumber, status: 'active' }
    : { tokenNumber: parseInt(req.params.tokenNumber,10), status: 'active' };
  const booking=await Booking.findOne(query);
  if(!booking)return res.status(404).json({error:'Booking not found'});
  booking.remainingWait=Math.max(0,booking.remainingWait+mins);
  await booking.save();
  res.json(booking);
}catch(err){res.status(500).json({error:err.message})}});
app.post('/api/bookings/:tokenNumber/cancel',async(req,res)=>{try{
  const query = mongoose.Types.ObjectId.isValid(req.params.tokenNumber)
    ? { _id: req.params.tokenNumber, status: 'active' }
    : { tokenNumber: parseInt(req.params.tokenNumber,10), status: 'active' };
  const booking=await Booking.findOneAndUpdate(query,{status:'cancelled'},{new:true});
  if(booking){
    const gapId='gap_'+Date.now()+'_'+Math.floor(Math.random()*1000);
    const newGap=new QueueGap({id:gapId,salonId:booking.salonId,barberName:booking.barberName,duration:booking.servicesDuration,bookingTimeMs:booking.bookingTimeMs});
    await newGap.save();
    res.json({booking,gap:newGap});
  }else{res.status(404).json({error:'Booking not found'})}
}catch(err){res.status(500).json({error:err.message})}});
app.post('/api/bookings/:tokenNumber/feedback',async(req,res)=>{try{
  const{salonRating,barberRating,comment}=req.body;
  const query = mongoose.Types.ObjectId.isValid(req.params.tokenNumber)
    ? { _id: req.params.tokenNumber }
    : { tokenNumber: parseInt(req.params.tokenNumber,10) };
  const booking=await Booking.findOneAndUpdate(query,{feedback:{salonRating,barberRating,comment}},{new:true});
  if(booking){res.json(booking)}else{res.status(404).json({error:'Booking not found'})}
}catch(err){res.status(500).json({error:err.message})}});
app.get('/api/barber-stats',async(req,res)=>{try{const bookings=await Booking.find({status:'completed'});const stats={};bookings.forEach(b=>{if(!stats[b.barberName])stats[b.barberName]={};b.servicesIds.forEach(id=>{stats[b.barberName][id]=(stats[b.barberName][id]||0)+1})});res.json(stats)}catch(err){res.status(500).json({error:err.message})}});
const startServerCountdown = () => {
  setInterval(async () => {
    try {
      const todayStr = new Date().toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' });
      await Booking.updateMany(
        { status: 'active', dateString: { $ne: todayStr } },
        { status: 'cancelled' }
      );

      const activeBookings = await Booking.find({ status: 'active' });
      const queueGaps = await QueueGap.find();
      if (activeBookings.length === 0 && queueGaps.length === 0) return;

      const groups = {};
      activeBookings.forEach(b => {
        const key = `${b.salonId}|${b.barberName}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(b);
      });
      queueGaps.forEach(g => {
        const key = `${g.salonId}|${g.barberName}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(g);
      });

      for (const key in groups) {
        const timeline = groups[key].sort((a, b) => (a.bookingTimeMs || 0) - (b.bookingTimeMs || 0));
        if (timeline.length > 0) {
          const head = timeline[0];
          if (head.tokenNumber !== undefined) {
            const elapsedMins = (Date.now() - (head.bookingTimeMs || Date.now())) / (60 * 1000);
            if (elapsedMins >= (head.travelTime || 0)) {
              const newRemaining = Math.max(0, head.remainingWait - 1/60);
              if (newRemaining <= 0) {
                await Booking.updateOne({ _id: head._id }, { remainingWait: 0, status: 'completed' });
                await checkSalonAdMilestone(head.salonId);
              } else {
                await Booking.updateOne({ _id: head._id }, { remainingWait: newRemaining });
              }
            }
          } else {
            const newDuration = Math.max(0, head.duration - 1/60);
            if (newDuration <= 0) {
              await QueueGap.deleteOne({ _id: head._id });
            } else {
              await QueueGap.updateOne({ _id: head._id }, { duration: newDuration });
            }
          }
        }
      }
    } catch (err) {
      console.error("Error in server countdown interval:", err);
    }
  }, 1000);
};

startServerCountdown();

app.listen(PORT,()=>{console.log(`Server running on port ${PORT}`)});

