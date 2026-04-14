'use client';

import { useState } from 'react';
import { Plus, X, AlertCircle, Home, MapPin, Users, Bed, DollarSign, Image as ImageIcon, CheckCircle } from 'lucide-react';

type UnitStatus = 'available' | 'booked' | 'maintenance';

interface FormData {
  name: string;
  category: string;
  status: UnitStatus;
  price: string;
  rooms: string;
  location: string;
  capacity: string;
  description: string;
  amenities: string[];
  images: File[];
  previews: string[];
}

export default function CreateUnitForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: '',
    status: 'available',
    price: '',
    rooms: '',
    location: '',
    capacity: '',
    description: '',
    amenities: [],
    images: [],
    previews: [],
  });

  const [amenityInput, setAmenityInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'images' && e.target instanceof HTMLInputElement && e.target.files) {
      const files = Array.from(e.target.files);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...files],
        previews: [...prev.previews, ...newPreviews]
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => {
      // Clean up the object URL to avoid memory leaks
      URL.revokeObjectURL(prev.previews[index]);
      
      return {
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
        previews: prev.previews.filter((_, i) => i !== index)
      };
    });
  };

  const handleAddAmenity = () => {
    if (amenityInput.trim()) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenityInput.trim()]
      }));
      setAmenityInput('');
    }
  };

  const handleRemoveAmenity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Nama unit harus diisi');
      return false;
    }
    if (!formData.category.trim()) {
      setError('Kategori harus diisi');
      return false;
    }
    if (!formData.price.trim()) {
      setError('Harga harus diisi');
      return false;
    }
    if (!formData.rooms.trim()) {
      setError('Jumlah kamar harus diisi');
      return false;
    }
    if (!formData.location.trim()) {
      setError('Lokasi harus diisi');
      return false;
    }
    if (!formData.capacity.trim()) {
      setError('Kapasitas harus diisi');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      
      const sendData = new FormData();
      sendData.append('category', formData.category);
      sendData.append('status_unit', formData.status);
      sendData.append('description', formData.description);
      sendData.append('capacity', formData.capacity);
      sendData.append('name', formData.name);
      sendData.append('price', formData.price);
      sendData.append('alamat', formData.location);
      sendData.append('jumlah_kamar', formData.rooms);
      
      // Add multiple images
      formData.images.forEach(file => {
        sendData.append('images', file);
      });
      
      // Add amenities
      formData.amenities.forEach(fas => {
        sendData.append('fasilitas', fas);
      });

      const response = await fetch('http://localhost:5050/api/admin/accommodations', {
        method: 'POST',
        credentials: 'include',
        body: sendData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gagal membuat unit');
      }

      setSuccess('Unit berhasil dibuat!');
      // Reset form
      setFormData({
        name: '',
        category: '',
        status: 'available',
        price: '',
        rooms: '',
        location: '',
        capacity: '',
        description: '',
        amenities: [],
        images: [],
        previews: [],
      });

      setTimeout(() => {
        setSuccess('');
        // Redirect ke halaman admin
        window.location.href = '/admin';
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Buat Unit Baru</h1>
        <p className="text-gray-600">Lengkapi informasi unit properti Anda dengan detail</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-start gap-3 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg shadow-sm">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">Berhasil!</p>
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          </div>
        )} 

        {/* Informasi Dasar Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-600" />
            Informasi Dasar
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nama Unit */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-black mb-2">
                Nama Unit <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Contoh: Villa Premium A"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400 shadow-sm"
              />
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Kategori <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Contoh: Villa, Apartemen, Rumah"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400 shadow-sm"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black shadow-sm"
              >
                <option value="available">Tersedia</option>
                <option value="booked">Dipesan</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
        </div>

        {/* Detail Properti Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            Detail Properti
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Harga */}
            <div>
              <label className="block text-sm font-bold text-black mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Harga (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Contoh: 500000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400 shadow-sm"
              />
            </div>

            {/* Jumlah Kamar */}
            <div>
              <label className="block text-sm font-bold text-black mb-2 flex items-center gap-2">
                <Bed className="w-4 h-4" />
                Jumlah Kamar <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="rooms"
                value={formData.rooms}
                onChange={handleChange}
                placeholder="Contoh: 2"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400 shadow-sm"
              />
            </div>

            {/* Lokasi */}
            <div>
              <label className="block text-sm font-bold text-black mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Lokasi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Contoh: Jl. Merdeka No. 123"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400 shadow-sm"
              />
            </div>

            {/* Kapasitas */}
            <div>
              <label className="block text-sm font-bold text-black mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Kapasitas Tamu <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="Contoh: 4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Deskripsi & Media Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-black mb-6">Deskripsi & Media</h2>
          
          {/* Deskripsi */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-black mb-2">
              Deskripsi
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Jelaskan detail unit Anda..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400 shadow-sm resize-none"
            />
          </div>

          {/* Upload Gambar */}
          <div>
            <label className="block text-sm font-bold text-black mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Upload Unit Photos
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Plus className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 underline">Click to upload photos</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG or JPEG (multiple allowed)</p>
                </div>
                <input 
                  type="file" 
                  name="images"
                  className="hidden" 
                  multiple 
                  accept="image/*"
                  onChange={handleChange}
                />
              </label>
            </div>

            {/* Previews */}
            {formData.previews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                {formData.previews.map((preview, index) => (
                  <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-video">
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Fasilitas Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-black mb-6">Fasilitas (Amenitas)</h2>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={amenityInput}
              onChange={(e) => setAmenityInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
              placeholder="Contoh: WiFi, AC, Kolam Renang"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400 shadow-sm"
            />
            <button
              type="button"
              onClick={handleAddAmenity}
              className="px-6 py-3 bg-gray-900 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-gray-800 transition-all shadow-md hover:shadow-lg"

            >
              <Plus className="w-5 h-5" />
              Tambah
            </button>
          </div>

          {/* Amenitas List */}
          {formData.amenities.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {formData.amenities.map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className="font-medium">{amenity}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAmenity(index)}
                    className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">Belum ada fasilitas yang ditambahkan</p>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-40 py-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-gray-800 transition-all shadow-md hover:shadow-lg"

          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Memproses...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 " />
                Buat Unit
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => window.location.href = '/admin'}
            className="flex-1 px-6 py-4 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-lg transition-colors shadow-md hover:shadow-lg text-lg"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
