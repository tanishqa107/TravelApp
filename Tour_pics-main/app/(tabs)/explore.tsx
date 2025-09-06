import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  StyleSheet,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { SaveAll } from 'lucide-react-native';
import {useCounterStore} from '../../store/Store'
import Fontisto from '@expo/vector-icons/Fontisto';
import * as Location from 'expo-location';
const { width } = Dimensions.get('window');

const PhotoCaptureApp = () => {
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const hydration = useCounterStore((s)=>s.hydration)
  const setHydration = useCounterStore((s)=>s.setHydration)
  const[checked , setChecked] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    time: '',
  });
  function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}
  const saveData = async () => {
  if (!selectedImage) return alert("No image selected");
  
  try {
    // 1. Ask for media library permissions
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access media library is required!');
      return;
    }

    // 2. Copy image to local filesystem
    const fileName = selectedImage.uri.split('/').pop(); // get last part of URI
    const localUri = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.copyAsync({
      from: selectedImage.uri,
      to: localUri,
    });

    // 3. Save the image to media library (optional: to gallery)
    const asset = await MediaLibrary.createAssetAsync(localUri);

    // 4. Save metadata as a JSON file in FileSystem
    const metadata = {
      title : formData.title,
      description : formData.description,
      location : formData.location,
      date: formData.date,
      time : formData.time,
      image: asset.uri,
      id : generateId()
    };

    const metadataFileName = `${formData.title.replace(/\s+/g, '_')}_meta.json`;
    const metadataUri = `${FileSystem.documentDirectory}${metadataFileName}`;
    await FileSystem.writeAsStringAsync(metadataUri, JSON.stringify(metadata));
    setHydration(!hydration)
    alert('Image and metadata saved locally!');
    console.log('Image URI:', asset.uri);
    console.log('Metadata URI:', metadataUri);

  } catch (err) {
    console.error('Save error:', err);
    alert('Error saving image or metadata');
  }
};
  useEffect(() => {
    // Request permissions on component mount
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || galleryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and photo library permissions are required to use this app.',
        [{ text: 'OK' }]
      );
    }
  };

  const openCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
        // Auto-fill current date and time
        const now = new Date();
        setFormData({
          ...formData,
          date: now.toLocaleDateString(),
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const openGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  const handleInputChange = (field : any, value : any) => {
    setFormData({ ...formData, [field]: value });
  };

  const savePhoto = () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first');
      return;
    }

    if (!formData.title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your photo');
      return;
    }
    saveData()
    setFormData({
       title: '',
    description: '',
    location: '',
    date: '',
    time: '',
    })
    setSelectedImage(null)
    // Here you would typically save to your backend or local storage
    Alert.alert(
      'Photo Saved!',
      `Photo "${formData.title}" has been saved successfully.`,
      [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setSelectedImage(null);
            setFormData({
              title: '',
              description: '',
              location: '',
              date: '',
              time: '',
            });
          }
        }
      ]
    );
  };

const fillCurrentLocation = async () => {
  try {
    // 1. Ask for permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }

    // 2. Get current position with high accuracy
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
      mayShowUserSettingsDialog: true, // Android
    });

    const { latitude, longitude } = location.coords;

    // 3. Reverse geocode to get address
    const addresses = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (addresses.length === 0) {
      throw new Error('No address found');
    }

    const address = addresses[0];
    const formattedAddress = `${address.name ?? ''}, ${address.street ?? ''}, ${address.city ?? ''}, ${address.country ?? ''}`.trim();

    return formattedAddress;

  } catch (error) {
    console.error("Location error:", error);
    return null;
  }
};

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Photo Capture</Text>
        <Text style={styles.headerSubtitle}>Capture & organize your memories</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Camera/Gallery Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.cameraButton]}
            onPress={openCamera}
            activeOpacity={0.8}
          >
            <Ionicons name="camera" size={28} color="#fff" />
            <Text style={styles.buttonText}>Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.galleryButton]}
            onPress={openGallery}
            activeOpacity={0.8}
          >
            <Ionicons name="images" size={28} color="#fff" />
            <Text style={styles.buttonText}>Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* Selected Image Display */}
        {selectedImage && (
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: selectedImage.uri }} 
              style={styles.selectedImage}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => setSelectedImage(null)}
              >
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => handleInputChange('title', text)}
              placeholder="Enter photo title"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => handleInputChange('description', text)}
              placeholder="Describe your photo"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(text) => handleInputChange('location', text)}
              placeholder="Where was this taken?"
              placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity style ={{marginTop : 10 , marginLeft :5 , display :'flex' , flexDirection :'row' , gap :5}} onPress={async()=>{
              setChecked(!checked)
              if(!checked){
               setFormData((prev) => ({ ...prev, location: 'Loading ..' }));
              const loc = await fillCurrentLocation();
              setFormData((prev) => ({ ...prev, location: loc ?? '' }));
              }

            }}>
              {!checked ? <Fontisto name="checkbox-passive" size={15} color="black" /> : <Fontisto name="checkbox-active" size={15} color="black" />}
              
              
              <Text style ={{color : "#FF6B6B" ,fontWeight :'bold'}}> Use Current Location</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rowContainer}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Date</Text>
              <TextInput
                style={styles.input}
                value={formData.date}
                onChangeText={(text) => handleInputChange('date', text)}
                placeholder="MM/DD/YYYY"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Time</Text>
              <TextInput
                style={styles.input}
                value={formData.time}
                onChangeText={(text) => handleInputChange('time', text)}
                placeholder="HH:MM"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={savePhoto}
          activeOpacity={0.8}
        >
          <Ionicons name="save" size={24} color="#fff" />
          <Text style={styles.saveButtonText}>Save Photo</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cameraButton: {
    backgroundColor: '#007AFF',
  },
  galleryButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  imageContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  selectedImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 10,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    flex: 1,
    marginHorizontal: 4,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default PhotoCaptureApp;