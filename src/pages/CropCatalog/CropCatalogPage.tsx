import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchCropTypes, createCrop, deleteCropType, fetchCrops } from '../../store/cropSlice';
import { Crop, CreateCropRequest } from '../../types/crop';
import { getRolesFromToken } from '../../utils/jwt';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { CropList } from './components/CropList';
import { CropForm } from './components/CropForm';
import { QuickAddCropTypeModal } from './components/QuickAddCropTypeModal';
import { CreateCropTypeRequest } from '../../types/crop';
import { createCropType } from '../../store/cropSlice';

export const CropCatalogPage: React.FC = () => {
  const { farmId } = useParams<{ farmId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { crops, loading, error } = useSelector((state: RootState) => state.crop);
  const { userToken } = useSelector((state: RootState) => state.auth);
  
  // Giải mã token để lấy quyền thực tế
  const roles = userToken ? getRolesFromToken(userToken) : [];
  const isAdmin = roles.includes('ROLE_ADMIN');
  
  const [view, setView] = useState<'list' | 'form'>('list');
  const [activeTab, setActiveTab] = useState<'crops' | 'types'>('crops');
  const [editingCrop, setEditingCrop] = useState<Crop | undefined>(undefined);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);

  useEffect(() => {
    if (farmId || isAdmin) {
      // Tải cả danh mục cây trồng và loại cây trồng
      dispatch(fetchCropTypes());
      dispatch(fetchCrops());
    }
  }, [dispatch, farmId, isAdmin]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleAdd = () => {
    if (activeTab === 'types') {
      setIsTypeModalOpen(true);
      return;
    }
    setEditingCrop(undefined);
    setView('form');
  };

  const handleEdit = (crop: Crop) => {
    setEditingCrop(crop);
    setView('form');
  };

  const handleDelete = async (id: string) => {
    try {
      if (!isAdmin) {
        toast.error('Bạn không có quyền thực hiện thao tác này');
        return;
      }
      
      if (activeTab === 'types') {
        await dispatch(deleteCropType(id)).unwrap();
        toast.success('Xóa loại cây trồng thành công');
        // Tải lại cả cây trồng vì có thể ảnh hưởng đến danh mục
        dispatch(fetchCrops());
        dispatch(fetchCropTypes());
      } else {
        // [LƯU Ý] Tài liệu Backend hiện tại chưa cung cấp DELETE /api/v1/crops
        toast.error('API xóa cây trồng hiện chưa được hỗ trợ');
      }
    } catch (err: any) {
      toast.error(err || 'Thao tác thất bại');
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (editingCrop) {
        // [ĐANG CHỜ API]
        toast.error('API cập nhật hiện chưa sẵn sàng');
      } else {
        await dispatch(createCrop(data as CreateCropRequest)).unwrap();
        toast.success('Thêm cây trồng mới thành công');
        // Tải lại để lấy thông tin đầy đủ từ Backend (bao gồm các object liên quan)
        dispatch(fetchCrops());
      }
      setView('list');
    } catch (err: any) {
      toast.error(err || 'Thao tác thất bại');
    }
  };

  const handleSaveType = async (data: CreateCropTypeRequest) => {
    try {
      await dispatch(createCropType(data)).unwrap();
      toast.success('Thêm loại cây trồng mới thành công');
      setIsTypeModalOpen(false);
      // Tải lại danh sách
      dispatch(fetchCropTypes());
    } catch (err: any) {
      toast.error(err || 'Thao tác thất bại');
    }
  };

  const handleCancel = () => {
    setView('list');
  };

  return (
    <div className="w-full h-full flex flex-col">

      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div
            key="list"
            className="w-full flex-1 flex flex-col"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            <CropList
              crops={activeTab === 'crops' ? crops : []}
              mode={activeTab}
              onTabChange={setActiveTab}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              loading={loading}
              isAdmin={isAdmin}
            />
          </motion.div>
        ) : (
          <motion.div
            key="form"
            className="w-full flex-1 flex flex-col"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <CropForm
              initialData={editingCrop}
              onSave={handleSave}
              onCancel={handleCancel}
              existingCrops={crops}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <QuickAddCropTypeModal 
        isOpen={isTypeModalOpen}
        onClose={() => setIsTypeModalOpen(false)}
        onSave={handleSaveType}
        loading={loading}
      />
    </div>
  );
};

export default CropCatalogPage;
