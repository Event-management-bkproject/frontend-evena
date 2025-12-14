import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EventSearchRequest } from '../types/event';

interface UIState {
  // ========== SIDEBAR ==========
  sidebarOpen: boolean;

  // ========== MODALS ==========
  modals: {
    createEvent: boolean;
    updateEvent: boolean;
    deleteConfirm: boolean;
    createVenue: boolean;
    createCategory: boolean;
    createOrganization: boolean;
    ticketType: boolean;
  };

  // ID của item đang được edit/delete (để pass vào modal)
  selectedItemId: string | number | null;

  // ========== FILTERS (Local UI State) ==========
  eventFilters: EventSearchRequest;

  // ========== LOADING STATES ==========
  loading: {
    [key: string]: boolean;
  };
}

const initialState: UIState = {
  sidebarOpen: true,
  modals: {
    createEvent: false,
    updateEvent: false,
    deleteConfirm: false,
    createVenue: false,
    createCategory: false,
    createOrganization: false,
    ticketType: false,
  },
  selectedItemId: null,
  eventFilters: {
    keyword: '',
    page: 0,
    size: 10,
    sortBy: 'createdAt',
    sortDirection: 'desc',
  },
  loading: {},
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // ========== SIDEBAR ==========
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },

    // ========== MODALS ==========
    openModal: (
      state,
      action: PayloadAction<{ modal: keyof UIState['modals']; itemId?: string | number }>
    ) => {
      state.modals[action.payload.modal] = true;
      if (action.payload.itemId !== undefined) {
        state.selectedItemId = action.payload.itemId;
      }
    },
    closeModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = false;
      // Reset selected item khi đóng modal
      if (action.payload === 'updateEvent' || action.payload === 'deleteConfirm') {
        state.selectedItemId = null;
      }
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach((key) => {
        state.modals[key as keyof UIState['modals']] = false;
      });
      state.selectedItemId = null;
    },

    // ========== FILTERS ==========
    setEventFilter: (
      state,
      action: PayloadAction<Partial<EventSearchRequest>>
    ) => {
      state.eventFilters = { ...state.eventFilters, ...action.payload };
    },
    resetEventFilters: (state) => {
      state.eventFilters = initialState.eventFilters;
    },

    // ========== LOADING ==========
    setLoading: (
      state,
      action: PayloadAction<{ key: string; value: boolean }>
    ) => {
      state.loading[action.payload.key] = action.payload.value;
    },
    clearLoading: (state) => {
      state.loading = {};
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  openModal,
  closeModal,
  closeAllModals,
  setEventFilter,
  resetEventFilters,
  setLoading,
  clearLoading,
} = uiSlice.actions;

export default uiSlice.reducer;
