
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Product } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

const Inventory: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, isLoading } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({ name: '', price: 0, stock: 0, category: '' });

  const handleOpenModal = (product: Product | null = null) => {
    setEditingProduct(product);
    if (product) {
      setNewProduct({ name: product.name, price: product.price, stock: product.stock, category: product.category });
    } else {
      setNewProduct({ name: '', price: 0, stock: 0, category: 'Bebidas' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async () => {
    if (editingProduct) {
      await updateProduct({ ...editingProduct, ...newProduct });
    } else {
      await addProduct(newProduct);
    }
    handleCloseModal();
  };
  
  const handleDelete = async (productId: string) => {
    if(window.confirm('Tem certeza que deseja remover este produto?')) {
        await deleteProduct(productId);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value }));
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Gerenciamento de Estoque</h2>
        <Button onClick={() => handleOpenModal()} disabled={isLoading}>Adicionar Produto</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3">Nome</th>
              <th className="p-3">Categoria</th>
              <th className="p-3">Preço</th>
              <th className="p-3">Estoque</th>
              <th className="p-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{product.name}</td>
                <td className="p-3">{product.category}</td>
                <td className="p-3">R$ {product.price.toFixed(2)}</td>
                <td className="p-3">
                  <span className={`${product.stock < 20 ? 'text-red-500 font-semibold' : ''}`}>{product.stock}</span>
                </td>
                <td className="p-3 text-center space-x-2">
                  <Button variant="secondary" onClick={() => handleOpenModal(product)} className="py-1 px-3" disabled={isLoading}>Editar</Button>
                  <Button variant="danger" onClick={() => handleDelete(product.id)} className="py-1 px-3" disabled={isLoading}>Remover</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProduct ? 'Editar Produto' : 'Adicionar Produto'}>
        <div className="space-y-4">
          <div>
            <label>Nome</label>
            <input type="text" name="name" value={newProduct.name} onChange={handleChange} className="w-full p-2 border rounded" disabled={isLoading} />
          </div>
          <div>
            <label>Categoria</label>
            <select name="category" value={newProduct.category} onChange={handleChange} className="w-full p-2 border rounded bg-white" disabled={isLoading}>
                <option value="Bebidas">Bebidas</option>
                <option value="Salgados">Salgados</option>
                <option value="Doces">Doces</option>
                <option value="Outros">Outros</option>
            </select>
          </div>
          <div>
            <label>Preço</label>
            <input type="number" name="price" value={newProduct.price} onChange={handleChange} className="w-full p-2 border rounded" disabled={isLoading} />
          </div>
          <div>
            <label>Estoque</label>
            <input type="number" name="stock" value={newProduct.stock} onChange={handleChange} className="w-full p-2 border rounded" disabled={isLoading} />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
             <Button variant="secondary" onClick={handleCloseModal} disabled={isLoading}>Cancelar</Button>
             <Button onClick={handleSaveProduct} disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Salvar'}
             </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default Inventory;
