import { Router } from 'express';
import Shop from '../models/Shop.js';
import QueueEntry from '../models/QueueEntry.js';
import { requireAuth, allow } from '../middleware/auth.js';
const router=Router();
router.post('/join/:shopId',requireAuth,allow('customer'),async(req,res,next)=>{try{const shop=await Shop.findById(req.params.shopId);if(!shop||!shop.isOpen)return res.status(404).json({message:'This queue is unavailable'});const existing=await QueueEntry.findOne({shop:shop._id,customer:req.user._id,status:{$in:['waiting','serving']}});if(existing)return res.status(409).json({message:'You are already in this queue'});const last=await QueueEntry.findOne({shop:shop._id}).sort('-token');const waiting=await QueueEntry.countDocuments({shop:shop._id,status:'waiting'});const entry=await QueueEntry.create({shop:shop._id,customer:req.user._id,token:(last?.token||0)+1,estimatedWait:waiting*shop.averageServiceMinutes});req.app.get('io').to(`shop:${shop._id}`).emit('queue:changed');res.status(201).json({entry});}catch(e){next(e)}});
router.get('/my',requireAuth,allow('customer'),async(req,res,next)=>{try{res.json({entries:await QueueEntry.find({customer:req.user._id}).populate('shop').sort('-createdAt')})}catch(e){next(e)}});
router.patch('/:id/status',requireAuth,allow('owner'),async(req,res,next)=>{try{const entry=await QueueEntry.findById(req.params.id).populate('shop');if(!entry||entry.shop.owner.toString()!==req.user.id)return res.status(404).json({message:'Queue entry not found'});entry.status=req.body.status;if(req.body.status==='completed')entry.servedAt=new Date();await entry.save();req.app.get('io').to(`shop:${entry.shop._id}`).emit('queue:changed');res.json({entry});}catch(e){next(e)}});
export default router;
