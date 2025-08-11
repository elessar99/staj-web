import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import './search.css'; // Ayrı CSS dosyası (isteğe bağlı)

const SearchBar = forwardRef(({
  value,
  onChange,
  placeholder = "Ara...",
  size = "medium",
  variant = "default",
  className = "",
  disabled = false,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const sizeClasses = {
    small: 'searchInput-small',
    medium: 'searchInput-medium',
    large: 'searchInput-large'
  };

  const variantClasses = {
    default: 'searchInput-default',
    primary: 'searchInput-primary',
    dark: 'searchInput-dark'
  };

  return (
    <div className={`searchBar ${className}`}>
      <input
        ref={ref}
        type="text"
        className={`searchInput ${sizeClasses[size]} ${variantClasses[variant]}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        onFocus={onFocus}
        onBlur={onBlur}
        aria-label={placeholder}
        {...props}
      />
    </div>
  );
});

SearchBar.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['default', 'primary', 'dark']),
  className: PropTypes.string,
  disabled: PropTypes.bool,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func
};

export default SearchBar;