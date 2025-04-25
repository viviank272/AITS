import { library } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import {
  faPlus,
  faEdit,
  faTrash,
  faSearch,
  faFilter,
  faSave,
  faTimes,
  faKey,
  faUser,
  faToggleOn,
  faToggleOff
} from '@fortawesome/free-solid-svg-icons';

// Prevent Font Awesome from adding its CSS since we did it manually above
config.autoAddCss = false;

// Add icons to library
library.add(
  faPlus,
  faEdit,
  faTrash,
  faSearch,
  faFilter,
  faSave,
  faTimes,
  faKey,
  faUser,
  faToggleOn,
  faToggleOff
); 