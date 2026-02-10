import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from "react";

export type View = "list" | "create" | "edit" | "detail" | "search";

interface AppState {
  view: View;
  selectedId: string | null;
  searchQuery: string;
  filterLanguage: string | undefined;
  sidebarCollapsed: boolean;
  settingsOpen: boolean;
}

type AppAction =
  | { type: "SET_VIEW"; view: View }
  | { type: "SELECT_SNIPPET"; id: string }
  | { type: "DESELECT_SNIPPET" }
  | { type: "SET_SEARCH_QUERY"; query: string }
  | { type: "SET_FILTER_LANGUAGE"; language: string | undefined }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "SET_SETTINGS_OPEN"; open: boolean }
  | { type: "NAVIGATE_TO_CREATE" }
  | { type: "NAVIGATE_TO_LIST" };

const initialState: AppState = {
  view: "list",
  selectedId: null,
  searchQuery: "",
  filterLanguage: undefined,
  sidebarCollapsed: false,
  settingsOpen: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_VIEW":
      return { ...state, view: action.view };
    case "SELECT_SNIPPET":
      return { ...state, selectedId: action.id, view: "detail" };
    case "DESELECT_SNIPPET":
      return { ...state, selectedId: null, view: "list" };
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.query };
    case "SET_FILTER_LANGUAGE":
      return { ...state, filterLanguage: action.language };
    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case "SET_SETTINGS_OPEN":
      return { ...state, settingsOpen: action.open };
    case "NAVIGATE_TO_CREATE":
      return { ...state, selectedId: null, view: "create" };
    case "NAVIGATE_TO_LIST":
      return { ...state, selectedId: null, view: "list", searchQuery: "" };
    default:
      return state;
  }
}

const AppContext = createContext<AppState>(initialState);
const AppDispatchContext = createContext<Dispatch<AppAction>>(() => {});

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppContext.Provider>
  );
}

export function useAppState() {
  return useContext(AppContext);
}

export function useAppDispatch() {
  return useContext(AppDispatchContext);
}
