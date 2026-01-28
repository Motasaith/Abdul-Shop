import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, DollarSign, ShoppingCart, MessageCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAppDispatch } from '../../hooks/redux';
import { addToCart } from '../../store/slices/cartSlice';
import toast from 'react-hot-toast';

interface HaggleModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: {
        _id: string;
        name: string;
        price: number;
        countInStock: number;
        images: { url: string }[];
    };
}

interface Message {
    sender: 'ai' | 'user';
    text: string;
}

const HaggleModal: React.FC<HaggleModalProps> = ({ isOpen, onClose, product }) => {
    const dispatch = useAppDispatch();
    const [offer, setOffer] = useState('');
    const [history, setHistory] = useState<Message[]>([]);
    const [status, setStatus] = useState<'pending' | 'accepted' | 'rejected' | 'thinking'>('pending');
    const [acceptedPrice, setAcceptedPrice] = useState<number | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setHistory([{ sender: 'ai', text: `Hi! I'm the shopkeeper. This ${product.name} is listed at $${product.price}, but I might give you a deal if you ask nicely.` }]);
            setOffer('');
            setStatus('pending');
            setAcceptedPrice(null);
        }
    }, [isOpen, product]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    const handleNegotiate = async () => {
        if (!offer || isNaN(Number(offer))) return;

        // Validate offer logic (optional on frontend)
        const offerAmount = Number(offer);

        // Add user message
        const userMsg: Message = { sender: 'user', text: `I'll give you $${offerAmount}.` };
        setHistory(prev => [...prev, userMsg]);
        setStatus('thinking');

        try {
            const apiUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
            const response = await axios.post(`${apiUrl}/api/haggle/negotiate`, {
                productId: product._id,
                offer: offerAmount,
                history: history.map(h => ({ role: h.sender === 'ai' ? 'model' : 'user', content: h.text }))
            });

            const { status: dealStatus, reply, final_price } = response.data.data;

            const aiMsg: Message = { sender: 'ai', text: reply };
            setHistory(prev => [...prev, aiMsg]);
            setStatus(dealStatus);

            if (dealStatus === 'accepted') {
                setAcceptedPrice(final_price || offerAmount);
                toast.success(`Deal accepted at $${final_price}!`);
            } else {
                // If rejected, allow another offer? Assuming logic from prompt allows re-try locally but API is stateless mostly.
                // Actually, prompt says "Counter-offer with a price closer to List Price".
            }

        } catch (error) {
            console.error('Haggle Error:', error);
            setHistory(prev => [...prev, { sender: 'ai', text: "Oof, my calculator is broken. Try again later." }]);
            setStatus('pending');
        }

        setOffer('');
    };

    const handleAddToCart = () => {
        if (acceptedPrice !== null) {
            dispatch(addToCart({
                product: product._id,
                name: product.name,
                image: product.images[0]?.url || '',
                price: acceptedPrice, // Use discounted price
                countInStock: product.countInStock,
                quantity: 1
            }));
            toast.success(`Added to cart at $${acceptedPrice}!`);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        className="relative bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 flex justify-between items-center text-white">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-full">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">HaggleAI</h3>
                                    <p className="text-xs opacity-90">Negotiate your price!</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="p-4 h-80 overflow-y-auto bg-gray-50 dark:bg-gray-900" ref={scrollRef}>
                            <div className="space-y-4">
                                {history.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${msg.sender === 'user'
                                                ? 'bg-blue-600 text-white rounded-br-none'
                                                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-gray-700'
                                            }`}>
                                            <p className="text-sm">{msg.text}</p>
                                        </div>
                                    </div>
                                ))}
                                {status === 'thinking' && (
                                    <div className="flex justify-start">
                                        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-bl-none shadow-sm flex gap-1 items-center border border-gray-100 dark:border-gray-700">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer / Input */}
                        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                            {status === 'accepted' ? (
                                <motion.button
                                    initial={{ scale: 0.9 }}
                                    animate={{ scale: 1 }}
                                    onClick={handleAddToCart}
                                    className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart className="w-6 h-6" />
                                    Add to Cart @ ${acceptedPrice}
                                </motion.button>
                            ) : (
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                                        <input
                                            type="number"
                                            value={offer}
                                            onChange={(e) => setOffer(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleNegotiate()}
                                            placeholder="Your offer..."
                                            disabled={status === 'thinking'}
                                            className="w-full pl-8 pr-4 py-3 bg-gray-100 dark:bg-gray-900 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 font-medium"
                                        />
                                    </div>
                                    <button
                                        onClick={handleNegotiate}
                                        disabled={status === 'thinking' || !offer}
                                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        Offer
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default HaggleModal;
