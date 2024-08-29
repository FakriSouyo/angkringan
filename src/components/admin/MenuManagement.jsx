import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    status: 'active'
  });

  useEffect(() => {
    fetchMenuItems();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error checking admin status:', error);
      } else {
        setIsAdmin(data.is_admin);
        console.log('Is admin:', data.is_admin);
      }
    }
  };

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setImageFile(file);
  };

  const uploadImage = async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `menu-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('menuimg')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl }, error: urlError } = supabase.storage
        .from('menuimg')
        .getPublicUrl(filePath);

      if (urlError) {
        throw urlError;
      }

      return publicUrl;
    } catch (error) {
      console.error('Error in uploadImage:', error);
      throw error;
    }
  };

  const clearForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      category: '',
      status: 'active'
    });
    setEditingItem(null);
    setImageFile(null);
  };

  const handleAddItem = async (newItem) => {
    if (!isAdmin) {
      toast.error('Only admin can add menu items');
      return;
    }

    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const itemToAdd = {
        title: newItem.title || 'Untitled',
        description: newItem.description || '',
        price: Number(newItem.price) || 0,
        category: newItem.category || 'Uncategorized',
        image_url: imageUrl,
        status: newItem.status || 'active'
      };

      const { data, error } = await supabase
        .from('menu_items')
        .insert([itemToAdd])
        .select()
        .single();

      if (error) throw error;

      console.log('Item added successfully:', data);
      setMenuItems([data, ...menuItems]);
      toast.success('Item added successfully');
      clearForm();
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error(`Failed to add item: ${error.message}`);
    }
  };

  const handleEditItem = async (updatedItem) => {
    if (!isAdmin) {
      toast.error('Only admin can update menu items');
      return;
    }

    console.log('Attempting to update item:', updatedItem);
    
    try {
      const { data: existingItem, error: fetchError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', updatedItem.id)
        .single();

      if (fetchError) {
        console.error('Error fetching existing item:', fetchError);
        throw new Error(`Failed to fetch existing item: ${fetchError.message}`);
      }

      if (!existingItem) {
        throw new Error(`No item found with ID: ${updatedItem.id}`);
      }

      console.log('Existing item:', existingItem);

      let imageUrl = updatedItem.image_url;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const updatedFields = { 
        ...updatedItem, 
        image_url: imageUrl,
        price: Number(updatedItem.price) || 0
      };
      console.log('Fields to update:', updatedFields);

      const { data, error } = await supabase
        .from('menu_items')
        .update(updatedFields)
        .eq('id', updatedItem.id)
        .select();

      if (error) {
        console.error('Supabase update error:', error);
        throw new Error(`Failed to update item in database: ${error.message}`);
      }

      console.log('Supabase update response:', data);

      if (!data || data.length === 0) {
        console.error('Update operation did not return any data');
        throw new Error('Update operation did not affect any rows');
      }

      console.log('Item updated successfully:', data[0]);
      setMenuItems(menuItems.map(item => item.id === updatedItem.id ? data[0] : item));
      clearForm();
      toast.success('Item updated successfully');
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error(`Failed to update item: ${error.message}`);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!isAdmin) {
      toast.error('Only admin can delete menu items');
      return;
    }

    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setMenuItems(menuItems.filter(item => item.id !== id));
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    if (!isAdmin) {
      toast.error('Only admin can change item status');
      return;
    }

    const newStatus = currentStatus === 'active' ? 'draft' : 'active';
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .update({ status: newStatus })
        .eq('id', id)
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setMenuItems(menuItems.map(item => item.id === id ? { ...item, status: newStatus } : item));
        toast.success(`Item ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      } else {
        throw new Error('Update operation did not affect any rows');
      }
    } catch (error) {
      console.error('Error toggling item status:', error);
      toast.error(`Failed to update item status: ${error.message}`);
    }
  };

  const renderForm = () => (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const item = Object.fromEntries(formData.entries());
      if (editingItem) {
        handleEditItem({ ...item, id: editingItem.id });
      } else {
        handleAddItem(item);
      }
    }} className="bg-card p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-semibold mb-4">{editingItem ? 'Edit Item' : 'Tambah Item Baru'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input 
          type="text" 
          name="title" 
          placeholder="Nama Menu" 
          required 
          value={formData.title} 
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          className="input" 
        />
        <input 
          type="number" 
          name="price" 
          placeholder="Harga" 
          required 
          value={formData.price} 
          onChange={(e) => setFormData({...formData, price: e.target.value})}
          className="input" 
        />
        <textarea 
          name="description" 
          placeholder="Deskripsi" 
          required 
          value={formData.description} 
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="input md:col-span-2" 
        />
        <select 
          name="category" 
          required 
          value={formData.category} 
          onChange={(e) => setFormData({...formData, category: e.target.value})}
          className="input"
        >
          <option value="">Pilih Kategori</option>
          <option value="Makanan">Makanan</option>
          <option value="Minuman">Minuman</option>
          <option value="Sate & Gorengan">Sate & Gorengan</option>
          <option value="Jajanan">Jajanan</option>
        </select>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-primary file:text-white
              hover:file:bg-primary/80"
          />
          {editingItem?.image_url && !imageFile && (
            <img src={editingItem.image_url} alt={editingItem.title} className="mt-2 w-32 h-32 object-contain rounded-md" />
          )}
          {imageFile && (
            <img src={URL.createObjectURL(imageFile)} alt="Preview" className="mt-2 w-32 h-32 object-contain rounded-md" />
          )}
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
          {editingItem ? 'Update Item' : 'Tambah Item'}
        </button>
        {editingItem && (
          <button 
            type="button" 
            onClick={clearForm} 
            className="ml-2 bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
          >
            Cancel
          </button>
        )}
      </div>
      {/* <select 
        name="status" 
        required 
        value={formData.status} 
        onChange={(e) => setFormData({...formData, status: e.target.value})}
        className="input mt-4"
      >
        <option value="active">Active</option>
        <option value="draft">Draft</option>
      </select> */}
    </form>
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manajemen Menu</h2>
      {renderForm()}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map(item => (
          <div key={item?.id || 'temp-key'} className="bg-card p-4 rounded-lg shadow">
            {item?.image_url && (
              <img 
                src={item.image_url} 
                alt={item?.title || 'Menu item'} 
                className="w-full h-48 object-contain rounded-md mb-4" 
              />
            )}
            <h3 className="font-bold">{item?.title || 'Untitled'}</h3>
            <p className="text-sm text-muted-foreground">{item?.description || 'No description'}</p>
            <p className="font-semibold mt-2">Rp {item?.price?.toLocaleString() || '0'}</p>
            <p className="text-sm mt-1">Category: {item?.category || 'Uncategorized'}</p>
            <p className="text-sm mt-1">Status: {item?.status || 'Unknown'}</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setEditingItem(item);
                  setFormData({
                    title: item.title,
                    description: item.description,
                    price: item.price,
                    category: item.category,
                    status: item.status
                  });
                }}
                className="text-blue-500 hover:text-blue-700"
              >
                <FiEdit />
              </button>
              <button
                onClick={() => handleDeleteItem(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                <FiTrash2 />
              </button>
              <button
                onClick={() => handleToggleStatus(item.id, item.status)}
                className={`${item.status === 'active' ? 'text-green-500 hover:text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {item.status === 'active' ? <FiEye /> : <FiEyeOff />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuManagement;