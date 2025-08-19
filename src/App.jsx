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
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setDeliveries(deliveryService.getByMerchantId(user.Id));
    setAvailableDrivers(userService.getAllDrivers());
  }, [user.Id]);

  const handleAssignDriver = (deliveryId, driverId) => {
    deliveryService.assignDriver(deliveryId, driverId);
    setDeliveries(deliveryService.getByMerchantId(user.Id));
    const driver = userService.getById(driverId);
    setToast({ message: `Livraison assignée à ${driver.name}`, type: 'success' });
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
              <h1 className="text-2xl font-bold text-gray-900">🏪 Tableau de Bord Commerçant</h1>
              <span className="text-gray-500">Bonjour, {user.name}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">{user.businessName}</p>
                <p className="text-sm text-gray-600">{user.phone}</p>
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
                const driver = delivery.driverId ? userService.getById(delivery.driverId) : null;
                return (
                  <div key={delivery.Id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">Livraison #{delivery.Id}</h3>
                        <p className="text-gray-600">{delivery.customerName}</p>
                        {driver && <p className="text-sm text-gray-500">Livreur: {driver.name}</p>}
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
                      {delivery.status === 'pending' && (
                        <div className="flex items-center space-x-2">
                          <select
                            onChange={(e) => handleAssignDriver(delivery.Id, parseInt(e.target.value))}
                            className="border border-gray-300 rounded px-3 py-1 text-sm"
                          >
                            <option value="">Choisir un livreur</option>
                            {availableDrivers.map(driver => (
                              <option key={driver.Id} value={driver.Id}>
                                {driver.name} - {driver.phone}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      
                      {driver && (
                        <button
                          onClick={() => setActiveChat(delivery)}
                          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-sm"
                        >
                          💬 Chat avec {driver.name}
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
                <span>Total livraisons</span>
                <span className="font-semibold">{deliveries.length}</span>
              </div>
              <div className="flex justify-between">
                <span>En attente</span>
                <span className="font-semibold text-yellow-600">
                  {deliveries.filter(d => d.status === 'pending').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>En cours</span>
                <span className="font-semibold text-orange-600">
                  {deliveries.filter(d => d.status === 'in_progress').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Livrées</span>
                <span className="font-semibold text-green-600">
                  {deliveries.filter(d => d.status === 'delivered').length}
                </span>
              </div>
              <hr />
              <div className="flex justify-between text-lg">
                <span>Chiffre d'affaires</span>
                <span className="font-bold text-green-600">
                  {deliveries.reduce((sum, d) => sum + d.amount, 0).toFixed(2)}€
                </span>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Livreurs Disponibles</h3>
              <div className="bg-white rounded-lg shadow p-4 space-y-3">
                {availableDrivers.map(driver => (
                  <div key={driver.Id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{driver.name}</p>
                      <p className="text-sm text-gray-500">{driver.phone}</p>
                    </div>
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                      Disponible
                    </span>
                  </div>
                ))}
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