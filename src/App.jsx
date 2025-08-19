import React, { useState, useEffect, useRef } from "react";

// Mock Data Services
const mockUsers = [
  { Id: 1, name: "Jean Martin", email: "jean@exemple.fr", password: "123", role: "driver", phone: "06 12 34 56 78", earnings: 245.50 },
  { Id: 2, name: "Marie Dubois", email: "marie@exemple.fr", password: "123", role: "merchant", phone: "06 87 65 43 21", businessName: "Café de la Place" },
  { Id: 3, name: "Pierre Moreau", email: "pierre@exemple.fr", password: "123", role: "driver", phone: "06 45 67 89 12", earnings: 189.25 },
  { Id: 4, name: "Sophie Laurent", email: "sophie@exemple.fr", password: "123", role: "merchant", phone: "06 23 45 67 89", businessName: "Boulangerie Laurent" }
];

const mockDeliveries = [
  { 
    Id: 1, 
    merchantId: 2, 
    driverId: 1, 
    customerName: "Client A", 
    address: "12 Rue de la Paix, Paris", 
    status: "delivered", 
    amount: 25.50, 
    createdAt: "2024-01-15T10:30:00Z",
    deliveredAt: "2024-01-15T11:15:00Z"
  },
  { 
    Id: 2, 
    merchantId: 4, 
    driverId: 3, 
    customerName: "Client B", 
    address: "45 Avenue des Champs, Lyon", 
    status: "in_progress", 
    amount: 18.75, 
    createdAt: "2024-01-15T14:20:00Z"
  },
  { 
    Id: 3, 
    merchantId: 2, 
    driverId: null, 
    customerName: "Client C", 
    address: "78 Boulevard Victor Hugo, Marseille", 
    status: "pending", 
    amount: 32.25, 
    createdAt: "2024-01-15T16:45:00Z"
  }
];

const mockMessages = [
  { 
    Id: 1, 
    deliveryId: 1, 
    senderId: 2, 
    receiverId: 1, 
    content: "Bonjour, la commande est prête pour livraison.", 
    timestamp: "2024-01-15T10:35:00Z" 
  },
  { 
    Id: 2, 
    deliveryId: 1, 
    senderId: 1, 
    receiverId: 2, 
    content: "Parfait, je suis en route. J'arrive dans 15 minutes.", 
    timestamp: "2024-01-15T10:37:00Z" 
  },
  { 
    Id: 3, 
    deliveryId: 2, 
    senderId: 4, 
    receiverId: 3, 
    content: "L'adresse de livraison a-t-elle changé ?", 
    timestamp: "2024-01-15T14:25:00Z" 
  }
];

// Services
const userService = {
  authenticate: (email, password) => {
    return mockUsers.find(user => user.email === email && user.password === password) || null;
  },
  getById: (id) => mockUsers.find(user => user.Id === id),
  getAllDrivers: () => mockUsers.filter(user => user.role === 'driver'),
  getAllMerchants: () => mockUsers.filter(user => user.role === 'merchant')
};

const deliveryService = {
  getAll: () => [...mockDeliveries],
  getByDriverId: (driverId) => mockDeliveries.filter(d => d.driverId === driverId),
  getByMerchantId: (merchantId) => mockDeliveries.filter(d => d.merchantId === merchantId),
  getById: (id) => mockDeliveries.find(d => d.Id === id),
  create: (deliveryData) => {
    const newId = Math.max(...mockDeliveries.map(d => d.Id)) + 1;
    const newDelivery = {
      Id: newId,
      ...deliveryData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      driverId: null,
      deliveredAt: null
    };
    mockDeliveries.push(newDelivery);
    return newDelivery;
  },
  update: (id, updates) => {
    const index = mockDeliveries.findIndex(d => d.Id === id);
    if (index !== -1) {
      mockDeliveries[index] = { ...mockDeliveries[index], ...updates };
      return mockDeliveries[index];
    }
    return null;
  },
  delete: (id) => {
    const index = mockDeliveries.findIndex(d => d.Id === id);
    if (index !== -1) {
      return mockDeliveries.splice(index, 1)[0];
    }
    return null;
  },
  updateStatus: (id, status) => {
    const delivery = mockDeliveries.find(d => d.Id === id);
    if (delivery) {
      delivery.status = status;
      if (status === 'delivered') {
        delivery.deliveredAt = new Date().toISOString();
      }
    }
    return delivery;
  },
  assignDriver: (id, driverId) => {
    const delivery = mockDeliveries.find(d => d.Id === id);
    if (delivery) {
      delivery.driverId = driverId;
      delivery.status = 'assigned';
    }
    return delivery;
  },
  rateDriver: (id, rating, comment) => {
    const delivery = mockDeliveries.find(d => d.Id === id);
    if (delivery && delivery.status === 'delivered') {
      delivery.driverRating = rating;
      delivery.driverRatingComment = comment;
    }
    return delivery;
  }
};

const customerService = {
  getAll: () => {
    const customers = {};
    mockDeliveries.forEach(delivery => {
      if (!customers[delivery.customerPhone]) {
        customers[delivery.customerPhone] = {
          Id: delivery.customerPhone,
          name: delivery.customerName,
          phone: delivery.customerPhone,
          address: delivery.address,
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: null
        };
      }
      customers[delivery.customerPhone].totalOrders++;
      customers[delivery.customerPhone].totalSpent += delivery.amount;
      if (!customers[delivery.customerPhone].lastOrderDate || 
          new Date(delivery.createdAt) > new Date(customers[delivery.customerPhone].lastOrderDate)) {
        customers[delivery.customerPhone].lastOrderDate = delivery.createdAt;
      }
    });
    return Object.values(customers);
  },
  getByMerchantId: (merchantId) => {
    const merchantDeliveries = mockDeliveries.filter(d => d.merchantId === merchantId);
    const customers = {};
    merchantDeliveries.forEach(delivery => {
      if (!customers[delivery.customerPhone]) {
        customers[delivery.customerPhone] = {
          Id: delivery.customerPhone,
          name: delivery.customerName,
          phone: delivery.customerPhone,
          address: delivery.address,
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: null
        };
      }
      customers[delivery.customerPhone].totalOrders++;
      customers[delivery.customerPhone].totalSpent += delivery.amount;
      if (!customers[delivery.customerPhone].lastOrderDate || 
          new Date(delivery.createdAt) > new Date(customers[delivery.customerPhone].lastOrderDate)) {
        customers[delivery.customerPhone].lastOrderDate = delivery.createdAt;
      }
    });
    return Object.values(customers);
  }
};

const messageService = {
  getByDeliveryId: (deliveryId) => mockMessages.filter(m => m.deliveryId === deliveryId),
  send: (deliveryId, senderId, receiverId, content) => {
    const newMessage = {
      Id: mockMessages.length + 1,
      deliveryId,
      senderId,
      receiverId,
      content,
      timestamp: new Date().toISOString()
    };
    mockMessages.push(newMessage);
    return newMessage;
  }
};

// Components
const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    setTimeout(() => {
      const user = userService.authenticate(email, password);
      if (user) {
        onLogin(user);
      } else {
        setError('Email ou mot de passe incorrect');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🚚 LivraisonChat</h1>
          <p className="text-gray-600">Connectez-vous à votre compte</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="votre@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Comptes de test :</p>
          <div className="text-xs space-y-1">
            <p><strong>Livreur :</strong> jean@exemple.fr / 123</p>
            <p><strong>Commerçant :</strong> marie@exemple.fr / 123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`}>
      {message}
    </div>
  );
};

const ChatWindow = ({ delivery, currentUser, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const otherUser = delivery.driverId === currentUser.Id 
    ? userService.getById(delivery.merchantId)
    : userService.getById(delivery.driverId);

  useEffect(() => {
    setMessages(messageService.getByDeliveryId(delivery.Id));
  }, [delivery.Id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message = messageService.send(
        delivery.Id,
        currentUser.Id,
        otherUser.Id,
        newMessage.trim()
      );
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md h-96 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{otherUser?.name}</h3>
            <p className="text-sm text-gray-500">Livraison #{delivery.Id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.Id}
              className={`mb-3 ${
                message.senderId === currentUser.Id ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block p-3 rounded-lg max-w-xs ${
                  message.senderId === currentUser.Id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.content}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Tapez votre message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              📤
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DriverDashboard = ({ user, onLogout }) => {
  const [deliveries, setDeliveries] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setDeliveries(deliveryService.getByDriverId(user.Id));
  }, [user.Id]);

  const handleStatusUpdate = (deliveryId, newStatus) => {
    deliveryService.updateStatus(deliveryId, newStatus);
    setDeliveries(deliveryService.getByDriverId(user.Id));
    setToast({ message: `Statut mis à jour vers ${newStatus}`, type: 'success' });
  };

  const handleAcceptDelivery = (deliveryId) => {
    deliveryService.assignDriver(deliveryId, user.Id);
    setDeliveries(deliveryService.getByDriverId(user.Id));
    setToast({ message: 'Livraison acceptée', type: 'success' });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'En attente',
      assigned: 'Assignée',
      in_progress: 'En cours',
      delivered: 'Livrée'
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">🚚 Tableau de Bord Livreur</h1>
              <span className="text-gray-500">Bonjour, {user.name}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Gains totaux</p>
                <p className="text-xl font-bold text-green-600">{user.earnings}€</p>
              </div>
              <button
                onClick={onLogout}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-6">Mes Livraisons</h2>
            <div className="space-y-4">
              {deliveries.map((delivery) => {
                const merchant = userService.getById(delivery.merchantId);
                return (
                  <div key={delivery.Id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">Livraison #{delivery.Id}</h3>
                        <p className="text-gray-600">{merchant?.businessName || merchant?.name}</p>
                        <p className="text-sm text-gray-500">{delivery.customerName}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(delivery.status)}`}>
                        {getStatusLabel(delivery.status)}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">📍 {delivery.address}</p>
                      <p className="font-semibold text-green-600">{delivery.amount}€</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setActiveChat(delivery)}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-sm"
                      >
                        💬 Chat
                      </button>
                      
                      {delivery.status === 'assigned' && (
                        <button
                          onClick={() => handleStatusUpdate(delivery.Id, 'in_progress')}
                          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 text-sm"
                        >
                          📍 Commencer
                        </button>
                      )}
                      
                      {delivery.status === 'in_progress' && (
                        <button
                          onClick={() => handleStatusUpdate(delivery.Id, 'delivered')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                        >
                          ✅ Livré
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-6">Statistiques</h2>
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="flex justify-between">
                <span>Livraisons totales</span>
                <span className="font-semibold">{deliveries.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Livraisons complétées</span>
                <span className="font-semibold text-green-600">
                  {deliveries.filter(d => d.status === 'delivered').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>En cours</span>
                <span className="font-semibold text-orange-600">
                  {deliveries.filter(d => d.status === 'in_progress').length}
                </span>
              </div>
              <hr />
              <div className="flex justify-between text-lg">
                <span>Gains totaux</span>
                <span className="font-bold text-green-600">{user.earnings}€</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {activeChat && (
        <ChatWindow
          delivery={activeChat}
          currentUser={user}
          onClose={() => setActiveChat(null)}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

const MerchantDashboard = ({ user, onLogout }) => {
  const [deliveries, setDeliveries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('deliveries');
  const [showNewDeliveryModal, setShowNewDeliveryModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [selectedDeliveries, setSelectedDeliveries] = useState([]);
  const [deliveryFilter, setDeliveryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [ratingDelivery, setRatingDelivery] = useState(null);

  useEffect(() => {
    setDeliveries(deliveryService.getByMerchantId(user.Id));
    setCustomers(customerService.getByMerchantId(user.Id));
    setAvailableDrivers(userService.getAllDrivers());
  }, [user.Id]);

  const handleCreateDelivery = (deliveryData) => {
    const newDelivery = deliveryService.create({
      ...deliveryData,
      merchantId: user.Id
    });
    setDeliveries(deliveryService.getByMerchantId(user.Id));
    setCustomers(customerService.getByMerchantId(user.Id));
    setToast({ message: 'Nouvelle livraison créée avec succès', type: 'success' });
    setShowNewDeliveryModal(false);
  };

  const handleEditDelivery = (deliveryData) => {
    deliveryService.update(editingDelivery.Id, deliveryData);
    setDeliveries(deliveryService.getByMerchantId(user.Id));
    setToast({ message: 'Livraison modifiée avec succès', type: 'success' });
    setEditingDelivery(null);
  };

  const handleDeleteDelivery = (deliveryId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette livraison ?')) {
      deliveryService.delete(deliveryId);
      setDeliveries(deliveryService.getByMerchantId(user.Id));
      setToast({ message: 'Livraison supprimée avec succès', type: 'success' });
    }
  };

  const handleDuplicateDelivery = (delivery) => {
    const duplicateData = { ...delivery };
    delete duplicateData.Id;
    delete duplicateData.status;
    delete duplicateData.driverId;
    delete duplicateData.createdAt;
    delete duplicateData.deliveredAt;
    const newDelivery = deliveryService.create(duplicateData);
    setDeliveries(deliveryService.getByMerchantId(user.Id));
    setToast({ message: 'Livraison dupliquée avec succès', type: 'success' });
  };

  const handleAssignDriver = (deliveryId, driverId) => {
    deliveryService.assignDriver(deliveryId, driverId);
    setDeliveries(deliveryService.getByMerchantId(user.Id));
    const driver = userService.getById(driverId);
    setToast({ message: `Livraison assignée à ${driver.name}`, type: 'success' });
  };

  const handleRateDriver = (deliveryId, rating, comment) => {
    deliveryService.rateDriver(deliveryId, rating, comment);
    setDeliveries(deliveryService.getByMerchantId(user.Id));
    setToast({ message: 'Évaluation du livreur enregistrée', type: 'success' });
    setRatingDelivery(null);
  };

  const handleBulkAssign = (driverId) => {
    selectedDeliveries.forEach(deliveryId => {
      deliveryService.assignDriver(deliveryId, driverId);
    });
    setDeliveries(deliveryService.getByMerchantId(user.Id));
    const driver = userService.getById(driverId);
    setToast({ message: `${selectedDeliveries.length} livraisons assignées à ${driver.name}`, type: 'success' });
    setSelectedDeliveries([]);
  };

  const handleBulkDelete = () => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedDeliveries.length} livraisons ?`)) {
      selectedDeliveries.forEach(deliveryId => {
        deliveryService.delete(deliveryId);
      });
      setDeliveries(deliveryService.getByMerchantId(user.Id));
      setToast({ message: `${selectedDeliveries.length} livraisons supprimées`, type: 'success' });
      setSelectedDeliveries([]);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'En attente',
      assigned: 'Assignée',
      in_progress: 'En cours',
      delivered: 'Livrée'
    };
    return labels[status] || status;
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesFilter = deliveryFilter === 'all' || delivery.status === deliveryFilter;
    const matchesSearch = searchQuery === '' || 
      delivery.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.Id.toString().includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const totalRevenue = deliveries.reduce((sum, d) => sum + d.amount, 0);
  const avgOrderValue = deliveries.length > 0 ? totalRevenue / deliveries.length : 0;
  const deliveredCount = deliveries.filter(d => d.status === 'delivered').length;
  const completionRate = deliveries.length > 0 ? (deliveredCount / deliveries.length * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">🏪 {user.businessName}</h1>
              <span className="text-gray-500">Bonjour, {user.name}</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowNewDeliveryModal(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
              >
                <span>➕</span>
                <span>Nouvelle Livraison</span>
              </button>
              <button
                onClick={() => setShowReportsModal(true)}
                className="bg-accent-600 text-white px-4 py-2 rounded-lg hover:bg-accent-700 flex items-center space-x-2"
              >
                <span>📊</span>
                <span>Rapports</span>
              </button>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
              >
                <span>⚙️</span>
                <span>Paramètres</span>
              </button>
              <button
                onClick={onLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Livraisons</p>
                <p className="text-2xl font-bold text-gray-900">{deliveries.length}</p>
              </div>
              <div className="text-primary-600">📦</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chiffre d'Affaires</p>
                <p className="text-2xl font-bold text-green-600">{totalRevenue.toFixed(2)}€</p>
              </div>
              <div className="text-green-600">💰</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Panier Moyen</p>
                <p className="text-2xl font-bold text-blue-600">{avgOrderValue.toFixed(2)}€</p>
              </div>
              <div className="text-blue-600">🛍️</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taux de Réussite</p>
                <p className="text-2xl font-bold text-purple-600">{completionRate.toFixed(1)}%</p>
              </div>
              <div className="text-purple-600">✅</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'deliveries', name: 'Livraisons', icon: '📦' },
                { id: 'customers', name: 'Clients', icon: '👥' },
                { id: 'analytics', name: 'Analyses', icon: '📊' },
                { id: 'drivers', name: 'Livreurs', icon: '🚗' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'deliveries' && (
              <div>
                {/* Delivery Filters and Search */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      placeholder="Rechercher par nom, adresse ou numéro..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-2 w-64"
                    />
                    <select
                      value={deliveryFilter}
                      onChange={(e) => setDeliveryFilter(e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-2"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="pending">En attente</option>
                      <option value="assigned">Assignée</option>
                      <option value="in_progress">En cours</option>
                      <option value="delivered">Livrée</option>
                    </select>
                  </div>

                  {selectedDeliveries.length > 0 && (
                    <div className="flex space-x-2">
                      <select
                        onChange={(e) => e.target.value && handleBulkAssign(parseInt(e.target.value))}
                        className="border border-gray-300 rounded px-3 py-2 text-sm"
                      >
                        <option value="">Assigner en lot</option>
                        {availableDrivers.map(driver => (
                          <option key={driver.Id} value={driver.Id}>
                            {driver.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleBulkDelete}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                      >
                        Supprimer ({selectedDeliveries.length})
                      </button>
                    </div>
                  )}
                </div>

                {/* Deliveries List */}
                <div className="space-y-4">
                  {filteredDeliveries.map((delivery) => {
                    const driver = delivery.driverId ? userService.getById(delivery.driverId) : null;
                    const isSelected = selectedDeliveries.includes(delivery.Id);
                    
                    return (
                      <div key={delivery.Id} className={`bg-gray-50 rounded-lg p-6 border-2 ${isSelected ? 'border-primary-200 bg-primary-50' : 'border-transparent'}`}>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedDeliveries([...selectedDeliveries, delivery.Id]);
                                } else {
                                  setSelectedDeliveries(selectedDeliveries.filter(id => id !== delivery.Id));
                                }
                              }}
                              className="mt-1"
                            />
                            <div>
                              <h3 className="font-semibold text-lg">Livraison #{delivery.Id}</h3>
                              <p className="text-gray-600">{delivery.customerName} - {delivery.customerPhone}</p>
                              {driver && <p className="text-sm text-gray-500">Livreur: {driver.name}</p>}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(delivery.status)}`}>
                              {getStatusLabel(delivery.status)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-1">📍 {delivery.address}</p>
                          <p className="font-semibold text-green-600">{delivery.amount}€</p>
                          {delivery.description && <p className="text-sm text-gray-500 mt-1">{delivery.description}</p>}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {delivery.status === 'pending' && (
                            <select
                              onChange={(e) => e.target.value && handleAssignDriver(delivery.Id, parseInt(e.target.value))}
                              className="border border-gray-300 rounded px-3 py-1 text-sm"
                            >
                              <option value="">Assigner un livreur</option>
                              {availableDrivers.map(driver => (
                                <option key={driver.Id} value={driver.Id}>
                                  {driver.name} - {driver.phone}
                                </option>
                              ))}
                            </select>
                          )}
                          
                          {driver && (
                            <button
                              onClick={() => setActiveChat(delivery)}
                              className="bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700 text-sm"
                            >
                              💬 Chat avec {driver.name}
                            </button>
                          )}

                          <button
                            onClick={() => setEditingDelivery(delivery)}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                          >
                            ✏️ Modifier
                          </button>

                          <button
                            onClick={() => handleDuplicateDelivery(delivery)}
                            className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 text-sm"
                          >
                            📄 Dupliquer
                          </button>

                          {delivery.status === 'delivered' && !delivery.driverRating && (
                            <button
                              onClick={() => setRatingDelivery(delivery)}
                              className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 text-sm"
                            >
                              ⭐ Évaluer le livreur
                            </button>
                          )}

                          {delivery.status === 'pending' && (
                            <button
                              onClick={() => handleDeleteDelivery(delivery.Id)}
                              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                            >
                              🗑️ Supprimer
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'customers' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Gestion des Clients</h3>
                  <button
                    onClick={() => setShowCustomerModal(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                  >
                    📞 Contacter un client
                  </button>
                </div>

                <div className="grid gap-4">
                  {customers.map((customer) => (
                    <div key={customer.Id} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-lg">{customer.name}</h4>
                          <p className="text-gray-600">{customer.phone}</p>
                          <p className="text-sm text-gray-500">{customer.address}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{customer.totalOrders} commandes</p>
                          <p className="text-green-600 font-semibold">{customer.totalSpent.toFixed(2)}€</p>
                          <p className="text-sm text-gray-500">
                            Dernière commande: {new Date(customer.lastOrderDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-lg font-semibold mb-6">Analyses Détaillées</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold mb-4">Répartition par Statut</h4>
                    <div className="space-y-3">
                      {['pending', 'assigned', 'in_progress', 'delivered'].map(status => {
                        const count = deliveries.filter(d => d.status === status).length;
                        const percentage = deliveries.length > 0 ? (count / deliveries.length * 100) : 0;
                        return (
                          <div key={status}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">{getStatusLabel(status)}</span>
                              <span className="text-sm">{count} ({percentage.toFixed(1)}%)</span>
                            </div>
                            <div className="bg-gray-200 rounded-full h-2">
                              <div className={`h-2 rounded-full ${getStatusColor(status).split(' ')[0]}`} style={{width: `${percentage}%`}}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold mb-4">Top Clients</h4>
                    <div className="space-y-3">
                      {customers.slice(0, 5).map(customer => (
                        <div key={customer.Id} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-gray-500">{customer.totalOrders} commandes</p>
                          </div>
                          <p className="font-semibold text-green-600">{customer.totalSpent.toFixed(2)}€</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'drivers' && (
              <div>
                <h3 className="text-lg font-semibold mb-6">Gestion des Livreurs</h3>
                <div className="grid gap-4">
                  {availableDrivers.map(driver => {
                    const driverDeliveries = deliveries.filter(d => d.driverId === driver.Id);
                    const completedDeliveries = driverDeliveries.filter(d => d.status === 'delivered');
                    const avgRating = completedDeliveries
                      .filter(d => d.driverRating)
                      .reduce((sum, d, _, arr) => sum + d.driverRating / arr.length, 0);
                    
                    return (
                      <div key={driver.Id} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-lg">{driver.name}</h4>
                            <p className="text-gray-600">{driver.phone}</p>
                            <p className="text-sm text-gray-500">{driver.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{driverDeliveries.length} livraisons assignées</p>
                            <p className="text-green-600 font-semibold">{completedDeliveries.length} terminées</p>
                            {avgRating > 0 && (
                              <p className="text-yellow-600">⭐ {avgRating.toFixed(1)}/5</p>
                            )}
                            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                              Disponible
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {showNewDeliveryModal && (
        <NewDeliveryModal
          onClose={() => setShowNewDeliveryModal(false)}
          onSubmit={handleCreateDelivery}
          customers={customers}
        />
      )}

      {editingDelivery && (
        <EditDeliveryModal
          delivery={editingDelivery}
          onClose={() => setEditingDelivery(null)}
          onSubmit={handleEditDelivery}
        />
      )}

      {ratingDelivery && (
        <DriverRatingModal
          delivery={ratingDelivery}
          driver={userService.getById(ratingDelivery.driverId)}
          onClose={() => setRatingDelivery(null)}
          onSubmit={handleRateDriver}
        />
      )}

      {showCustomerModal && (
        <CustomerModal
          customers={customers}
          onClose={() => setShowCustomerModal(false)}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          user={user}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {showReportsModal && (
        <ReportsModal
          deliveries={deliveries}
          customers={customers}
          onClose={() => setShowReportsModal(false)}
        />
      )}

      {activeChat && (
        <ChatWindow
          delivery={activeChat}
          currentUser={user}
          onClose={() => setActiveChat(null)}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

// New Delivery Modal Component
const NewDeliveryModal = ({ onClose, onSubmit, customers }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    address: '',
    amount: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerPhone || !formData.address || !formData.amount) {
      return;
    }
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount)
    });
  };

  const handleCustomerSelect = (customer) => {
    setFormData({
      ...formData,
      customerName: customer.name,
      customerPhone: customer.phone,
      address: customer.address
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Nouvelle Livraison</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {customers.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Clients existants</label>
            <select
              onChange={(e) => e.target.value && handleCustomerSelect(customers.find(c => c.phone === e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Sélectionner un client existant</option>
              {customers.map(customer => (
                <option key={customer.Id} value={customer.phone}>
                  {customer.name} - {customer.phone}
                </option>
              ))}
            </select>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du client *</label>
            <input
              type="text"
              required
              value={formData.customerName}
              onChange={(e) => setFormData({...formData, customerName: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
            <input
              type="tel"
              required
              value={formData.customerPhone}
              onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse de livraison *</label>
            <textarea
              required
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
              placeholder="Détails sur la commande..."
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700"
            >
              Créer la livraison
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Delivery Modal Component  
const EditDeliveryModal = ({ delivery, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    customerName: delivery.customerName,
    customerPhone: delivery.customerPhone,
    address: delivery.address,
    amount: delivery.amount.toString(),
    description: delivery.description || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Modifier la Livraison #{delivery.Id}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du client</label>
            <input
              type="text"
              required
              value={formData.customerName}
              onChange={(e) => setFormData({...formData, customerName: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input
              type="tel"
              required
              value={formData.customerPhone}
              onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <textarea
              required
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€)</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700"
            >
              Sauvegarder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Driver Rating Modal
const DriverRatingModal = ({ delivery, driver, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(delivery.Id, rating, comment);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Évaluer {driver.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
              placeholder="Votre commentaire sur le service..."
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700"
            >
              Évaluer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Customer Modal
const CustomerModal = ({ customers, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Contacter un Client</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="space-y-4">
          {customers.map(customer => (
            <div key={customer.Id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{customer.name}</h4>
                  <p className="text-gray-600">{customer.phone}</p>
                  <p className="text-sm text-gray-500">{customer.address}</p>
                </div>
                <div className="flex space-x-2">
                  <a
                    href={`tel:${customer.phone}`}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    📞 Appeler
                  </a>
                  <a
                    href={`sms:${customer.phone}`}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    💬 SMS
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

// Settings Modal
const SettingsModal = ({ user, onClose }) => {
  const [settings, setSettings] = useState({
    notifications: true,
    autoAssign: false,
    emailReports: true
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Paramètres</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Informations du Commerce</h4>
            <div className="space-y-2">
              <p><span className="font-medium">Nom:</span> {user.businessName}</p>
              <p><span className="font-medium">Contact:</span> {user.name}</p>
              <p><span className="font-medium">Téléphone:</span> {user.phone}</p>
              <p><span className="font-medium">Email:</span> {user.email}</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Préférences</h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                />
                <span>Notifications push</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.autoAssign}
                  onChange={(e) => setSettings({...settings, autoAssign: e.target.checked})}
                />
                <span>Attribution automatique des livreurs</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.emailReports}
                  onChange={(e) => setSettings({...settings, emailReports: e.target.checked})}
                />
                <span>Rapports par email</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

// Reports Modal
const ReportsModal = ({ deliveries, customers, onClose }) => {
  const today = new Date();
  const thisWeek = deliveries.filter(d => {
    const deliveryDate = new Date(d.createdAt);
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    return deliveryDate >= weekStart;
  });

  const thisMonth = deliveries.filter(d => {
    const deliveryDate = new Date(d.createdAt);
    return deliveryDate.getMonth() === today.getMonth() && 
           deliveryDate.getFullYear() === today.getFullYear();
  });

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Client,Telephone,Adresse,Montant,Status,Date\n" +
      deliveries.map(d => 
        `${d.Id},"${d.customerName}",${d.customerPhone},"${d.address}",${d.amount},${d.status},${d.createdAt}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "deliveries-export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Rapports et Analyses</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900">Cette Semaine</h4>
            <p className="text-2xl font-bold text-blue-600">{thisWeek.length}</p>
            <p className="text-sm text-blue-600">livraisons</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900">Ce Mois</h4>
            <p className="text-2xl font-bold text-green-600">{thisMonth.length}</p>
            <p className="text-sm text-green-600">livraisons</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-900">Total Clients</h4>
            <p className="text-2xl font-bold text-purple-600">{customers.length}</p>
            <p className="text-sm text-purple-600">clients uniques</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold">Données Détaillées</h4>
          <button
            onClick={exportData}
            className="bg-accent-600 text-white px-4 py-2 rounded-lg hover:bg-accent-700"
          >
            📥 Exporter CSV
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Taux de réussite</p>
              <p className="text-xl font-bold text-green-600">
                {deliveries.length > 0 ? 
                  ((deliveries.filter(d => d.status === 'delivered').length / deliveries.length) * 100).toFixed(1) : 0
                }%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Panier moyen</p>
              <p className="text-xl font-bold text-blue-600">
                {deliveries.length > 0 ? 
                  (deliveries.reduce((sum, d) => sum + d.amount, 0) / deliveries.length).toFixed(2) : 0
                }€
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">CA Total</p>
              <p className="text-xl font-bold text-purple-600">
                {deliveries.reduce((sum, d) => sum + d.amount, 0).toFixed(2)}€
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Meilleur client</p>
              <p className="text-xl font-bold text-orange-600">
                {customers.length > 0 ? 
                  customers.reduce((prev, current) => prev.totalSpent > current.totalSpent ? prev : current).totalSpent.toFixed(2) : 0
                }€
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (localStorage)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  if (currentUser.role === 'driver') {
    return <DriverDashboard user={currentUser} onLogout={handleLogout} />;
  }

  if (currentUser.role === 'merchant') {
    return <MerchantDashboard user={currentUser} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Rôle non reconnu</h1>
        <button
          onClick={handleLogout}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
        >
          Se reconnecter
        </button>
      </div>
    </div>
  );
}

export default App