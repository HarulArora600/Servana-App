import React, { useState, useEffect, useRef } from 'react';
import { 
  Button, 
  Text, 
  View, 
  StyleSheet, 
  Image, 
  FlatList, 
  TouchableOpacity, 
  Switch, 
  Alert,
  Appearance,
  useColorScheme,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useAuth0, Auth0Provider } from 'react-native-auth0';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import RazorpayCheckout from 'react-native-razorpay';
import services from './src/data/services';
import serviceProviders from './src/data/serviceProviders';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Custom themes with enhanced colors
const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200EE',
    background: '#F5F5F5',
    card: '#FFFFFF',
    text: '#212121',
    border: '#E0E0E0',
    notification: '#FF5252',
    secondary: '#03DAC6',
    surface: '#FFFFFF',
    error: '#B00020',
  },
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#BB86FC',
    background: '#121212',
    card: '#1E1E1E',
    text: '#E0E0E0',
    border: '#333333',
    notification: '#CF6679',
    secondary: '#03DAC6',
    surface: '#1E1E1E',
    error: '#CF6679',
  },
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Create contexts for theme and orders management
const ThemeContext = React.createContext({
  isDarkMode: false,
  toggleTheme: () => {},
});

const OrdersContext = React.createContext({
  orders: [],
  addOrder: () => {},
  updateOrderStatus: () => {},
});

// Order status constants
const ORDER_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

// Chat bot responses
const BOT_RESPONSES = {
  greeting: "Hello! I'm your Home Services Assistant. How can I help you today?",
  services: "We offer various home services including:\n- Plumbing\n- Electrical\n- Cleaning\n- Carpentry\n- Painting\n\nWhich service are you interested in?",
  pricing: "Our pricing varies based on the service and provider. Could you specify which service you'd like pricing for?",
  booking: "To book a service, please go to the Home tab and select the service you need. Then choose a provider and complete the payment.",
  payment: "We accept all major credit/debit cards, UPI, and net banking through our secure Razorpay integration.",
  support: "For immediate support, you can call our 24/7 helpline at +1 (800) 123-4567 or email us at support@homeservices.com",
  default: "I'm sorry, I didn't understand that. Could you rephrase or ask about:\n- Services we offer\n- Pricing\n- Booking process\n- Payment methods\n- Support options",
};

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Services" component={HomeTab} options={{ headerShown: false }} />
      <Stack.Screen name="ServiceProviders" component={ServiceProvidersScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
    </Stack.Navigator>
  );
};

const OrdersStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="OrdersList" component={OrdersScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
    </Stack.Navigator>
  );
};

const SupportStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SupportHome" component={SupportTab} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

const HomeTab = ({ navigation }) => {
  const { isDarkMode } = React.useContext(ThemeContext);
  const styles = createStyles(isDarkMode);

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.serviceCard}
      onPress={() => navigation.navigate('ServiceProviders', { serviceType: item.name })}
    >
      <Image source={{ uri: item.image }} style={styles.serviceImage} />
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.servicePrice}>{item.price}</Text>
        <Text style={styles.serviceDescription}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Available Services</Text>
      <FlatList
        data={services}
        renderItem={renderServiceItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const ServiceProvidersScreen = ({ route, navigation }) => {
  const { isDarkMode } = React.useContext(ThemeContext);
  const { serviceType } = route.params;
  const filteredProviders = serviceProviders.filter(provider => provider.service === serviceType);
  const styles = createStyles(isDarkMode);

  const renderProviderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.providerCard}
      onPress={() => navigation.navigate('Payment', { provider: item })}
    >
      <Image source={{ uri: item.image }} style={styles.providerImage} />
      <View style={styles.providerInfo}>
        <Text style={styles.providerName}>{item.name}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>{item.rating} ★</Text>
        </View>
        <Text style={styles.providerPrice}>{item.price}</Text>
        <Text style={styles.providerExperience}>{item.experience} experience</Text>
        <View style={styles.skillsContainer}>
          {item.skills.map((skill, index) => (
            <Text key={index} style={styles.skillTag}>{skill}</Text>
          ))}
        </View>
        <Text style={styles.providerLocation}>📍 {item.location}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{serviceType} Professionals</Text>
      {filteredProviders.length > 0 ? (
        <FlatList
          data={filteredProviders}
          renderItem={renderProviderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <Text style={styles.noProvidersText}>No providers available for this service</Text>
      )}
    </View>
  );
};

const PaymentScreen = ({ route, navigation }) => {
  const { isDarkMode } = React.useContext(ThemeContext);
  const { addOrder } = React.useContext(OrdersContext);
  const { provider } = route.params;
  const [isProcessing, setIsProcessing] = useState(false);
  const styles = createStyles(isDarkMode);

  const handlePayment = () => {
    setIsProcessing(true);
    const amount = parseInt(provider.price.replace(/[^0-9]/g, ''));
    const options = {
      description: `Payment for ${provider.service}`,
      image: provider.image,
      currency: 'INR',
      key: 'rzp_test_KtGqV1mcH2eOwQ',
      amount: amount * 100, // Convert to paise
      name: provider.name,
      prefill: {
        email: 'user@example.com',
        contact: '9191919191',
        name: 'User Name'
      },
      theme: { color: isDarkMode ? '#BB86FC' : '#6200EE' }
    };

    RazorpayCheckout.open(options)
      .then(data => {
        const newOrder = {
          id: Date.now().toString(),
          provider,
          paymentId: data.razorpay_payment_id,
          date: new Date().toISOString(),
          amount: provider.price,
          status: ORDER_STATUS.CONFIRMED,
          service: provider.service,
        };
        addOrder(newOrder);
        Alert.alert(
          'Payment Success', 
          `Your ${provider.service} service has been booked!`,
          [
            { text: 'OK', onPress: () => navigation.navigate('OrdersList') }
          ]
        );
      })
      .catch(error => {
        Alert.alert('Payment Error', error.description || 'Payment failed');
      })
      .finally(() => {
        setIsProcessing(false);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Confirm Payment</Text>
      <View style={styles.paymentCard}>
        <Image source={{ uri: provider.image }} style={styles.paymentProviderImage} />
        <Text style={styles.paymentProviderName}>{provider.name}</Text>
        <Text style={styles.paymentService}>{provider.service}</Text>
        <Text style={styles.paymentAmount}>Amount: {provider.price}</Text>
        
        <TouchableOpacity 
          style={[styles.payButton, isProcessing && styles.disabledButton]} 
          onPress={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.payButtonText}>Pay with Razorpay</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const OrdersScreen = ({ navigation }) => {
  const { isDarkMode } = React.useContext(ThemeContext);
  const { orders } = React.useContext(OrdersContext);
  const styles = createStyles(isDarkMode);

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetails', { order: item })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderService}>{item.service}</Text>
        <Text style={[
          styles.orderStatus,
          item.status === ORDER_STATUS.CONFIRMED && styles.statusConfirmed,
          item.status === ORDER_STATUS.COMPLETED && styles.statusCompleted,
          item.status === ORDER_STATUS.CANCELLED && styles.statusCancelled,
        ]}>
          {item.status}
        </Text>
      </View>
      <Text style={styles.orderProvider}>Provider: {item.provider.name}</Text>
      <Text style={styles.orderDate}>Date: {new Date(item.date).toLocaleDateString()}</Text>
      <Text style={styles.orderAmount}>Amount: {item.amount}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Orders</Text>
      {orders.length > 0 ? (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No orders yet</Text>
          <Text style={styles.emptySubText}>Book a service to see your orders here</Text>
        </View>
      )}
    </View>
  );
};

const OrderDetailsScreen = ({ route }) => {
  const { isDarkMode } = React.useContext(ThemeContext);
  const { updateOrderStatus } = React.useContext(OrdersContext);
  const { order } = route.params;
  const styles = createStyles(isDarkMode);

  const handleStatusUpdate = (newStatus) => {
    updateOrderStatus(order.id, newStatus);
    Alert.alert('Status Updated', `Order status changed to ${newStatus}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Order Details</Text>
      <View style={styles.orderDetailsCard}>
        <Image source={{ uri: order.provider.image }} style={styles.orderProviderImage} />
        <Text style={styles.orderDetailTitle}>Service</Text>
        <Text style={styles.orderDetailValue}>{order.service}</Text>
        
        <Text style={styles.orderDetailTitle}>Provider</Text>
        <Text style={styles.orderDetailValue}>{order.provider.name}</Text>
        
        <Text style={styles.orderDetailTitle}>Date</Text>
        <Text style={styles.orderDetailValue}>{new Date(order.date).toLocaleString()}</Text>
        
        <Text style={styles.orderDetailTitle}>Amount</Text>
        <Text style={styles.orderDetailValue}>{order.amount}</Text>
        
        <Text style={styles.orderDetailTitle}>Status</Text>
        <Text style={[
          styles.orderDetailValue,
          order.status === ORDER_STATUS.CONFIRMED && styles.statusConfirmed,
          order.status === ORDER_STATUS.COMPLETED && styles.statusCompleted,
          order.status === ORDER_STATUS.CANCELLED && styles.statusCancelled,
        ]}>
          {order.status}
        </Text>
        
        <Text style={styles.orderDetailTitle}>Payment ID</Text>
        <Text style={styles.orderDetailValue}>{order.paymentId}</Text>
        
        {order.status === ORDER_STATUS.CONFIRMED && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => handleStatusUpdate(ORDER_STATUS.COMPLETED)}
            >
              <Text style={styles.actionButtonText}>Mark as Completed</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleStatusUpdate(ORDER_STATUS.CANCELLED)}
            >
              <Text style={styles.actionButtonText}>Cancel Order</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const SupportTab = () => {
  const { isDarkMode } = React.useContext(ThemeContext);
  const styles = createStyles(isDarkMode);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef();

  // Initialize with bot greeting
  useEffect(() => {
    setMessages([{ text: BOT_RESPONSES.greeting, sender: 'bot', timestamp: new Date() }]);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot response after a delay
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage);
      setMessages(prev => [...prev, {
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  };

  const generateBotResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello there! How can I assist you with your home services today?";
    } else if (lowerMessage.includes('service') || lowerMessage.includes('offer')) {
      return BOT_RESPONSES.services;
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return BOT_RESPONSES.pricing;
    } else if (lowerMessage.includes('book') || lowerMessage.includes('schedule')) {
      return BOT_RESPONSES.booking;
    } else if (lowerMessage.includes('pay') || lowerMessage.includes('payment')) {
      return BOT_RESPONSES.payment;
    } else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return BOT_RESPONSES.support;
    } else if (lowerMessage.includes('thank')) {
      return "You're welcome! Is there anything else I can help you with?";
    } else {
      return BOT_RESPONSES.default;
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.botMessageContainer
      ]}>
        {!isUser && (
          <View style={styles.botAvatar}>
            <Icon name="android" size={20} color="white" />
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isUser ? styles.userMessageBubble : styles.botMessageBubble
        ]}>
          <Text style={isUser ? styles.userMessageText : styles.botMessageText}>
            {item.text}
          </Text>
          <Text style={styles.messageTime}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.chatContainer}>
      <View style={styles.chatHeader}>
        <View style={styles.chatHeaderContent}>
          <View style={styles.botAvatarLarge}>
            <Icon name="assistance" size={24} color="white" />
          </View>
          <View>
            <Text style={styles.chatTitle}>Home Services Assistant</Text>
            <Text style={styles.chatStatus}>
              {isTyping ? 'Typing...' : 'Online'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.helpButton}>
          {/* <Icon name="assistance" size={24} color={isDarkMode ? '#BB86FC' : '#6200EE'} /> */}
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        keyboardShouldPersistTaps="handled"
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => index.toString()}
          ListFooterComponent={
            isTyping && (
              <View style={styles.typingIndicator}>
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
              </View>
            )
          }
        />
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.messageInput}
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="Type your message..."
          placeholderTextColor={isDarkMode ? '#757575' : '#9E9E9E'}
          multiline
        />
        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={handleSendMessage}
          disabled={!inputMessage.trim()}
        >
          <Icon 
            name="send" 
            size={24} 
            color={inputMessage.trim() ? 
              (isDarkMode ? '#BB86FC' : '#6200EE') : 
              (isDarkMode ? '#757575' : '#BDBDBD')} 
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>

      <View style={styles.quickRepliesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={styles.quickReply}
            onPress={() => setInputMessage("What services do you offer?")}
          >
            <Text style={styles.quickReplyText}>Services</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickReply}
            onPress={() => setInputMessage("How much does it cost?")}
          >
            <Text style={styles.quickReplyText}>Pricing</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickReply}
            onPress={() => setInputMessage("How do I book a service?")}
          >
            <Text style={styles.quickReplyText}>Booking</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickReply}
            onPress={() => setInputMessage("What payment methods do you accept?")}
          >
            <Text style={styles.quickReplyText}>Payments</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickReply}
            onPress={() => setInputMessage("I need help with my order")}
          >
            <Text style={styles.quickReplyText}>Support</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

const ProfileTab = () => {
  const { authorize, clearSession, user, error, isLoading } = useAuth0();
  const { isDarkMode, toggleTheme } = React.useContext(ThemeContext);
  const styles = createStyles(isDarkMode);

  const onLogin = async () => {
    try {
      await authorize();
    } catch (e) {
      console.log(e);
    }
  };

  const onLogout = async () => {
    try {
      await clearSession();
    } catch (e) {
      console.log('Log out cancelled');
    }
  };

  if (isLoading) {
    return <View style={styles.container}><Text>Loading</Text></View>;
  }

  const loggedIn = user !== undefined && user !== null;

  return (
    <View style={[styles.container, styles.profileContainer]}>
      {loggedIn ? (
        <>
          {user.picture && (
            <Image source={{ uri: user.picture }} style={styles.profileImage} />
          )}
          <Text style={styles.profileName}>Welcome, {user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          
          <View style={styles.darkModeContainer}>
            <Text style={styles.darkModeText}>Dark Mode</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isDarkMode ? "#f5dd4b" : "#f4f3f4"}
              onValueChange={toggleTheme}
              value={isDarkMode}
            />
          </View>
          
          <Button onPress={onLogout} title="Log Out" color={isDarkMode ? "#CF6679" : "#FF5252"} />
        </>
      ) : (
        <>
          <Text style={styles.profileName}>Please log in to view your profile</Text>
          <Button onPress={onLogin} title="Log In" color={isDarkMode ? "#BB86FC" : "#6200EE"} />
        </>
      )}
      {error && <Text style={styles.errorText}>{error.message}</Text>}
    </View>
  );
};

const createStyles = (isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? CustomDarkTheme.colors.background : CustomLightTheme.colors.background,
    padding: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: isDarkMode ? CustomDarkTheme.colors.text : CustomLightTheme.colors.text,
    textAlign: 'center',
  },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: isDarkMode ? CustomDarkTheme.colors.card : CustomLightTheme.colors.card,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDarkMode ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  serviceInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: isDarkMode ? CustomDarkTheme.colors.text : CustomLightTheme.colors.text,
  },
  servicePrice: {
    fontSize: 16,
    color: isDarkMode ? CustomDarkTheme.colors.primary : CustomLightTheme.colors.primary,
    marginBottom: 5,
    fontWeight: '600',
  },
  serviceDescription: {
    fontSize: 14,
    color: isDarkMode ? '#B0B0B0' : '#666',
  },
  providerCard: {
    flexDirection: 'row',
    backgroundColor: isDarkMode ? CustomDarkTheme.colors.card : CustomLightTheme.colors.card,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDarkMode ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  providerImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 3,
    color: isDarkMode ? CustomDarkTheme.colors.text : CustomLightTheme.colors.text,
  },
  ratingContainer: {
    backgroundColor: '#FFD700',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  providerPrice: {
    fontSize: 16,
    color: isDarkMode ? CustomDarkTheme.colors.primary : CustomLightTheme.colors.primary,
    marginBottom: 3,
    fontWeight: '600',
  },
  providerExperience: {
    fontSize: 14,
    color: isDarkMode ? '#B0B0B0' : '#666',
    marginBottom: 8,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  skillTag: {
    backgroundColor: isDarkMode ? '#333' : '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
    fontSize: 12,
    color: isDarkMode ? '#E0E0E0' : '#333',
  },
  providerLocation: {
    fontSize: 14,
    color: isDarkMode ? '#B0B0B0' : '#666',
  },
  noProvidersText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: isDarkMode ? '#B0B0B0' : '#666',
  },
  profileContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: isDarkMode ? CustomDarkTheme.colors.primary : CustomLightTheme.colors.primary,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: isDarkMode ? CustomDarkTheme.colors.text : CustomLightTheme.colors.text,
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: 16,
    color: isDarkMode ? '#B0B0B0' : '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorText: {
    color: isDarkMode ? CustomDarkTheme.colors.error : CustomLightTheme.colors.error,
    marginTop: 20,
    textAlign: 'center',
  },
  darkModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  darkModeText: {
    marginRight: 10,
    fontSize: 16,
    color: isDarkMode ? CustomDarkTheme.colors.text : CustomLightTheme.colors.text,
  },
  paymentCard: {
    backgroundColor: isDarkMode ? CustomDarkTheme.colors.card : CustomLightTheme.colors.card,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDarkMode ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentProviderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  paymentProviderName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: isDarkMode ? CustomDarkTheme.colors.text : CustomLightTheme.colors.text,
  },
  paymentService: {
    fontSize: 16,
    color: isDarkMode ? '#B0B0B0' : '#666',
    marginBottom: 10,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: isDarkMode ? CustomDarkTheme.colors.primary : CustomLightTheme.colors.primary,
    marginBottom: 20,
  },
  payButton: {
    backgroundColor: isDarkMode ? CustomDarkTheme.colors.primary : CustomLightTheme.colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 30,
    width: '100%',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderCard: {
    backgroundColor: isDarkMode ? CustomDarkTheme.colors.card : CustomLightTheme.colors.card,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDarkMode ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderService: {
    fontSize: 18,
    fontWeight: 'bold',
    color: isDarkMode ? CustomDarkTheme.colors.text : CustomLightTheme.colors.text,
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusConfirmed: {
    backgroundColor: '#FFF3E0',
    color: '#FF6D00',
  },
  statusCompleted: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
  statusCancelled: {
    backgroundColor: '#FFEBEE',
    color: '#C62828',
  },
  orderProvider: {
    fontSize: 14,
    color: isDarkMode ? '#B0B0B0' : '#666',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: isDarkMode ? '#B0B0B0' : '#666',
    marginBottom: 4,
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: isDarkMode ? CustomDarkTheme.colors.primary : CustomLightTheme.colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: isDarkMode ? '#B0B0B0' : '#666',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 16,
    color: isDarkMode ? '#757575' : '#9E9E9E',
  },
  orderDetailsCard: {
    backgroundColor: isDarkMode ? CustomDarkTheme.colors.card : CustomLightTheme.colors.card,
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDarkMode ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderProviderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 20,
  },
  orderDetailTitle: {
    fontSize: 14,
    color: isDarkMode ? '#B0B0B0' : '#666',
    marginTop: 10,
  },
  orderDetailValue: {
    fontSize: 16,
    color: isDarkMode ? CustomDarkTheme.colors.text : CustomLightTheme.colors.text,
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: '48%',
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  // Chat bot styles
  chatContainer: {
    flex: 1,
    backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? '#333' : '#E0E0E0',
    backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
  },
  chatHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botAvatarLarge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isDarkMode ? '#BB86FC' : '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: isDarkMode ? '#E0E0E0' : '#212121',
  },
  chatStatus: {
    fontSize: 14,
    color: isDarkMode ? '#B0B0B0' : '#757575',
  },
  helpButton: {
    padding: 5,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messagesContent: {
    paddingBottom: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 5,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  botMessageContainer: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: isDarkMode ? '#BB86FC' : '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
  },
  userMessageBubble: {
    backgroundColor: isDarkMode ? '#BB86FC' : '#6200EE',
    borderBottomRightRadius: 2,
  },
  botMessageBubble: {
    backgroundColor: isDarkMode ? '#333333' : '#E0E0E0',
    borderBottomLeftRadius: 2,
  },
  userMessageText: {
    color: 'white',
    fontSize: 16,
  },
  botMessageText: {
    color: isDarkMode ? '#E0E0E0' : '#212121',
    fontSize: 16,
  },
  messageTime: {
    fontSize: 10,
    color: isDarkMode ? '#B0B0B0' : '#757575',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  typingIndicator: {
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: isDarkMode ? '#BB86FC' : '#6200EE',
    marginHorizontal: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: isDarkMode ? '#333' : '#E0E0E0',
    backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    alignItems: 'center',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: isDarkMode ? '#333' : '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    backgroundColor: isDarkMode ? '#333' : '#F5F5F5',
    color: isDarkMode ? '#E0E0E0' : '#212121',
  },
  sendButton: {
    marginLeft: 10,
    padding: 10,
  },
  quickRepliesContainer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: isDarkMode ? '#333' : '#E0E0E0',
    backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
  },
  quickReply: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: isDarkMode ? '#333' : '#E0E0E0',
    marginRight: 10,
  },
  quickReplyText: {
    color: isDarkMode ? '#E0E0E0' : '#212121',
    fontSize: 14,
  },
});

const App = () => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const [orders, setOrders] = useState([]);

  // Sync with system color scheme changes
  useEffect(() => {
    setIsDarkMode(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const addOrder = (newOrder) => {
    setOrders(prev => [newOrder, ...prev]);
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const theme = isDarkMode ? CustomDarkTheme : CustomLightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <OrdersContext.Provider value={{ orders, addOrder, updateOrderStatus }}>
        <Auth0Provider domain={"dev-slu50ihfshr18auh.us.auth0.com"} clientId={"pqxoFzrbNOkOu0aKVNJkTzGMtonTdG6P"}>
          <NavigationContainer theme={theme}>
            <Tab.Navigator
              screenOptions={{
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: isDarkMode ? '#9E9E9E' : 'gray',
                tabBarLabelStyle: { fontSize: 12 },
                tabBarStyle: { 
                  paddingVertical: 5, 
                  height: 100,
                  backgroundColor: theme.colors.card,
                  borderTopColor: theme.colors.border,
                },
              }}
            >
              <Tab.Screen 
                name="Home" 
                component={HomeStack}
                options={{
                  tabBarIcon: ({ color, size }) => (
                    <Text style={{ color, fontSize: size }}>🏠</Text>
                  ),
                }}
              />
              <Tab.Screen 
                name="Orders" 
                component={OrdersStack}
                options={{
                  tabBarIcon: ({ color, size }) => (
                    <Text style={{ color, fontSize: size }}>📦</Text>
                  ),
                  tabBarBadge: orders.length > 0 ? orders.length : null,
                }}
              />
              <Tab.Screen 
                name="Support" 
                component={SupportStack}
                options={{
                  tabBarIcon: ({ color, size }) => (
                    <Text style={{ color, fontSize: size }}>💬</Text>
                  ),
                }}
              />
              <Tab.Screen 
                name="Profile" 
                component={ProfileTab}
                options={{
                  tabBarIcon: ({ color, size }) => (
                    <Text style={{ color, fontSize: size }}>👤</Text>
                  ),
                }}
              />
            </Tab.Navigator>
          </NavigationContainer>
        </Auth0Provider>
      </OrdersContext.Provider>
    </ThemeContext.Provider>
  );
};

export default App;
