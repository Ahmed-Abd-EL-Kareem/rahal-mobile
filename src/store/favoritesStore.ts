import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useMMKVStore } from './mmkvStore';
import { Hotel, Destination } from '@/types/api';

interface FavoritesState {
  favoriteHotels: Hotel[];
  favoriteDestinations: Destination[];
  
  toggleHotelFavorite: (hotel: Hotel) => void;
  toggleDestinationFavorite: (destination: Destination) => void;
  
  isHotelFavorite: (id: string) => boolean;
  isDestinationFavorite: (id: string) => boolean;
  
  removeHotelFavorite: (id: string) => void;
  removeDestinationFavorite: (id: string) => void;
  clearFavorites: () => void;
}

const mmkvStorage = {
  getItem: (name: string) => {
    const value = useMMKVStore.getState().getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    useMMKVStore.getState().setString(name, value);
  },
  removeItem: (name: string) => {
    useMMKVStore.getState().delete(name);
  },
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteHotels: [],
      favoriteDestinations: [],

      toggleHotelFavorite: (hotel) => {
        const { favoriteHotels } = get();
        const exists = favoriteHotels.some((h) => h._id === hotel._id);
        if (exists) {
          set({
            favoriteHotels: favoriteHotels.filter((h) => h._id !== hotel._id),
          });
        } else {
          set({
            favoriteHotels: [...favoriteHotels, hotel],
          });
        }
      },

      toggleDestinationFavorite: (destination) => {
        const { favoriteDestinations } = get();
        const exists = favoriteDestinations.some((d) => d._id === destination._id);
        if (exists) {
          set({
            favoriteDestinations: favoriteDestinations.filter((d) => d._id !== destination._id),
          });
        } else {
          set({
            favoriteDestinations: [...favoriteDestinations, destination],
          });
        }
      },

      isHotelFavorite: (id) => {
        return get().favoriteHotels.some((h) => h._id === id);
      },

      isDestinationFavorite: (id) => {
        return get().favoriteDestinations.some((d) => d._id === id);
      },

      removeHotelFavorite: (id) => {
        set({
          favoriteHotels: get().favoriteHotels.filter((h) => h._id !== id),
        });
      },

      removeDestinationFavorite: (id) => {
        set({
          favoriteDestinations: get().favoriteDestinations.filter((d) => d._id !== id),
        });
      },

      clearFavorites: () => {
        set({
          favoriteHotels: [],
          favoriteDestinations: [],
        });
      },
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
