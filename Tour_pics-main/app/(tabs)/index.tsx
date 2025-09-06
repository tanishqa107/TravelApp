import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Modal, StatusBar, Dimensions } from 'react-native';
import { X, MapPin, Clock, Calendar } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import { useCounterStore } from '@/store/Store';
const { width, height } = Dimensions.get('window');

const PhotoGalleryApp = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<any>();
  const [modalVisible, setModalVisible] = useState(false);
  const [images, setImages] = useState<any>([])
  const hydration = useCounterStore((s)=>s.hydration)

useEffect(()=>{
  const loadAllSavedImages = async () => {
  try {
    const directory = FileSystem.documentDirectory;
    if (!directory) {
      throw new Error("Document directory not available");
    }

    const files = await FileSystem.readDirectoryAsync(directory);

    const metadataFiles = files.filter((file) => file.endsWith('_meta.json'));

    const allImages = [];

    for (const file of metadataFiles) {
      const metadataContent = await FileSystem.readAsStringAsync(directory + file);
      const metadata = JSON.parse(metadataContent);
      allImages.push(metadata);
    }
   setImages(allImages)
    return allImages;
  } catch (error) {
    console.error("Error loading saved images:", error);
    return [];
  }
};
loadAllSavedImages()
},[hydration])



  // Sample photo data
  const photos = [
    {
      id: 1,
      title: "Golden Hour",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
      description: "A breathtaking sunset over the mountain peaks, casting golden light across the valley below.",
      location: "Rocky Mountain National Park",
      time: "6:30 PM",
      date: "March 15, 2024"
    },
    {
      id: 2,
      title: "Ocean Waves",
      image: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop",
      description: "Powerful waves crashing against the rocky coastline during a dramatic storm.",
      location: "Big Sur, California",
      time: "4:15 PM",
      date: "February 28, 2024"
    },
    {
      id: 3,
      title: "City Lights",
      image: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop",
      description: "The vibrant city skyline illuminated against the dark night sky.",
      location: "New York City",
      time: "9:45 PM",
      date: "January 10, 2024"
    },
    {
      id: 4,
      title: "Forest Path",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
      description: "A peaceful walking trail winding through ancient redwood trees.",
      location: "Muir Woods, California",
      time: "11:20 AM",
      date: "April 5, 2024"
    },
    {
      id: 5,
      title: "Desert Bloom",
      image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop",
      description: "Vibrant wildflowers blooming in the desert after spring rain.",
      location: "Joshua Tree National Park",
      time: "7:10 AM",
      date: "March 22, 2024"
    },
    {
      id: 6,
      title: "Alpine Lake",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
      description: "Crystal clear mountain lake reflecting the surrounding peaks.",
      location: "Banff National Park",
      time: "2:30 PM",
      date: "May 18, 2024"
    }
  ];

  const openPhoto = (photo : any) => {
    console.log("On pressed : " , photo)
    setSelectedPhoto(photo);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedPhoto(null);
  };

  const PhotoCard = ({ photo } : {photo :any}) =>{
    console.log("Photo card : " , photo)
    return (
       <TouchableOpacity 
      style={{
        width: (width - 45) / 2,
        marginBottom: 15,
        backgroundColor: '#fff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        overflow: 'hidden'
      }}
      onPress={() => openPhoto(photo)}
      activeOpacity={0.9}
    >
      <Image 
        source={{ uri: photo.image }} 
        style={{
          width: '100%',
          height: 200,
          backgroundColor: '#f0f0f0'
        }}
        resizeMode="cover"
      />
      <View style={{ padding: 12 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#1a1a1a',
          lineHeight: 22
        }}>
          {photo.title}
        </Text>
      </View>
    </TouchableOpacity>
    )
  };
   if(images.length == 0){
     return (<>
     <View style={{
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef'
      }}>
        <Text style={{
          fontSize: 24,
          fontWeight: '700',
          color: '#1a1a1a',
          textAlign: 'center'
        }}>
          Tour Pics
        </Text>
      </View>
     <View style ={{flex :1 , display :'flex' , justifyContent :'center' , alignItems :"center" , backgroundColor :'white'}}>
      
      <Text>No Images 😭</Text>
    </View></>)
  }
   if(!images){
    return (<View style ={{flex :1 , display :'flex' , justifyContent :'center' , alignItems :"center" , backgroundColor :'white'}}>
      <Text>Loading.. Please wait!</Text>
    </View>)

 
 

  }
  return (
    <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={{
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef'
      }}>
        <Text style={{
          fontSize: 24,
          fontWeight: '700',
          color: '#1a1a1a',
          textAlign: 'center'
        }}>
          Tour Pics
        </Text>
      </View>

      {/* Gallery Grid */}
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 15,
          paddingBottom: 30
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between'
        }}>
          {images.map((photo:any) => (
            <PhotoCard key={photo.id} photo={photo} />
          ))}
        </View>
      </ScrollView>

      {/* Full Screen Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          justifyContent: 'center'
        }}>
          <StatusBar barStyle="light-content" backgroundColor="rgba(0, 0, 0, 0.95)" />
          
          {/* Close Button */}
          <TouchableOpacity 
            style={{
              position: 'absolute',
              top: 50,
              right: 20,
              zIndex: 1,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onPress={closeModal}
          >
            <X size={24} color="#fff" />
          </TouchableOpacity>

          {selectedPhoto && (
            <ScrollView 
              contentContainerStyle={{ flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 20 }}>
                {/* Full Screen Image */}
                <Image 
                  source={{ uri: selectedPhoto.image }} 
                  style={{
                    width: width - 40,
                    height: (width - 40) * 0.75,
                    borderRadius: 12,
                    marginBottom: 30
                  }}
                  resizeMode="cover"
                />

                {/* Photo Details */}
                <View style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 16,
                  padding: 20,
                  backdropFilter: 'blur(10px)'
                }}>
                  <Text style={{
                    fontSize: 24,
                    fontWeight: '700',
                    color: '#fff',
                    marginBottom: 12
                  }}>
                    {selectedPhoto.title}
                  </Text>

                  <Text style={{
                    fontSize: 16,
                    color: '#e9ecef',
                    lineHeight: 24,
                    marginBottom: 20
                  }}>
                    {selectedPhoto.description}
                  </Text>

                  {/* Location */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 12
                  }}>
                    <MapPin size={18} color="#74c0fc" />
                    <Text style={{
                      fontSize: 16,
                      color: '#fff',
                      marginLeft: 8,
                      fontWeight: '500'
                    }}>
                      {selectedPhoto.location}
                    </Text>
                  </View>

                  {/* Date and Time */}
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                  }}>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}>
                      <Calendar size={18} color="#74c0fc" />
                      <Text style={{
                        fontSize: 16,
                        color: '#fff',
                        marginLeft: 8,
                        fontWeight: '500'
                      }}>
                        {selectedPhoto.date}
                      </Text>
                    </View>

                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}>
                      <Clock size={18} color="#74c0fc" />
                      <Text style={{
                        fontSize: 16,
                        color: '#fff',
                        marginLeft: 8,
                        fontWeight: '500'
                      }}>
                        {selectedPhoto.time}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

export default PhotoGalleryApp;