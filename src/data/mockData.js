export const TURKIYE_ILLER = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Gaziantep', 'Konya', 'Mersin', 'Kayseri'];
export const KOMSU_ULKELER = ['Bulgaristan', 'Yunanistan', 'Gürcistan', 'Ermenistan', 'İran', 'Irak', 'Suriye'];

export const TRUCK_DATA = [
  { 
    id: 'mock1', 
    company: 'Lojitak AI Trans', 
    origin: 'İstanbul', 
    destination: 'Almanya', 
    departure: new Date(Date.now() + 3600000 * 2).toISOString(), 
    totalCapacity: 20000, 
    currentOccupancy: 18500, 
    basePrice: 1500, 
    rating: 4.9, 
    driver: 'Yapay Zeka' 
  },
  { 
    id: 'mock2', 
    company: 'Hızlı Nakliyat', 
    origin: 'İzmir', 
    destination: 'Yunanistan', 
    departure: new Date(Date.now() + 3600000 * 5).toISOString(), 
    totalCapacity: 20000, 
    currentOccupancy: 8000, 
    basePrice: 1200, 
    rating: 4.7, 
    driver: 'Sistem' 
  },
  { 
    id: 'mock3', 
    company: 'Global Lojistik', 
    origin: 'Bursa', 
    destination: 'Bulgaristan', 
    departure: new Date(Date.now() + 3600000 * 12).toISOString(), 
    totalCapacity: 20000, 
    currentOccupancy: 19500, 
    basePrice: 1800, 
    rating: 4.8, 
    driver: 'Otomatik' 
  }
];
