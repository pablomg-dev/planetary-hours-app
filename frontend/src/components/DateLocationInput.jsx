import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { Form, Row, Col } from 'react-bootstrap';
import 'react-datepicker/dist/react-datepicker.css';

function DateLocationInput({ onDataChange, darkMode }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [cityOptions, setCityOptions] = useState([]);
  const [cityInput, setCityInput] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [locationData, setLocationData] = useState(null);

  // Función para inferir la zona horaria basada en coordenadas
  const inferTimezone = (lat, lon) => {
    // Convertir strings a números si es necesario
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    
    // América del Norte
    if (longitude >= -168 && longitude <= -50) {
      if (latitude >= 50) return 'America/Anchorage';  // Alaska
      if (latitude >= 25) {
        if (longitude <= -115) return 'America/Los_Angeles';  // Pacífico
        if (longitude <= -100) return 'America/Denver';       // Montaña
        if (longitude <= -85) return 'America/Chicago';       // Central
        return 'America/New_York';                           // Este
      }
    }

    // América del Sur
    if (longitude >= -82 && longitude <= -35 && latitude <= 12 && latitude >= -56) {
      if (longitude <= -65) return 'America/Lima';          // Perú, Ecuador, Colombia
      if (latitude >= -15) return 'America/Caracas';        // Venezuela, Guayanas
      if (latitude >= -35) return 'America/Sao_Paulo';      // Brasil
      return 'America/Argentina/Buenos_Aires';              // Argentina
    }

    // Europa
    if (longitude >= -10 && longitude <= 40 && latitude >= 35 && latitude <= 72) {
      if (longitude <= 5) {
        if (latitude >= 43 && latitude <= 44) return 'Europe/Madrid';  // España peninsular
        return 'Europe/London';                            // Reino Unido, Portugal
      }
      if (longitude <= 15) return 'Europe/Paris';          // Francia, Alemania Occ.
      if (longitude <= 20) return 'Europe/Berlin';         // Alemania, Italia
      if (longitude <= 30) return 'Europe/Kiev';           // Europa del Este
      return 'Europe/Moscow';                              // Rusia Europea
    }

    // Islas Canarias (caso especial)
    if (latitude >= 27 && latitude <= 29.5 && longitude >= -18.5 && longitude <= -13) {
      return 'Atlantic/Canary';
    }

    // Asia
    if (longitude >= 40 && longitude <= 180) {
      if (longitude <= 75) return 'Asia/Dubai';            // Medio Oriente
      if (longitude <= 90) return 'Asia/Kolkata';          // India
      if (longitude <= 105) return 'Asia/Bangkok';         // Sudeste Asiático
      if (longitude <= 120) return 'Asia/Shanghai';        // China
      if (longitude <= 140) return 'Asia/Tokyo';           // Japón
    }

    // Oceanía
    if (latitude >= -50 && latitude <= 0 && longitude >= 110 && longitude <= 180) {
      return 'Australia/Sydney';
    }

    // África
    if (latitude >= -35 && latitude <= 37 && longitude >= -17 && longitude <= 51) {
      if (longitude <= 0) return 'Africa/Casablanca';      // África Occidental
      if (longitude <= 20) return 'Africa/Lagos';          // África Central
      if (longitude <= 40) return 'Africa/Nairobi';        // África Oriental
      return 'Africa/Johannesburg';                        // África del Sur
    }

    console.log('🌍 No se pudo determinar la zona horaria por coordenadas, usando zona horaria del navegador');
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  };

  // Obtener ubicación inicial
  useEffect(() => {
    if (navigator.geolocation && !locationData) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const timezone = inferTimezone(position.coords.latitude, position.coords.longitude);
          const newLocationData = {
            date: selectedDate.toISOString().split('T')[0],
            lat: position.coords.latitude.toString(),
            lon: position.coords.longitude.toString(),
            timezone: timezone,
            cityName: null
          };
          
          console.log('Configurando ubicación inicial:', newLocationData);
          setLocationData(newLocationData);
          onDataChange(newLocationData);
        },
        (error) => console.error('Error al obtener ubicación inicial:', error)
      );
    }
  }, []);

  // Buscar ciudades usando Nominatim simplificado
  useEffect(() => {
    if (cityInput.length < 2) return;
    
    const controller = new AbortController();

    // Lista de ciudades importantes para priorizar
    const importantCities = {
      'madrid': { lat: '40.4168', lon: '-3.7038', name: 'Madrid', country: 'España' },
      'barcelona': { lat: '41.3851', lon: '2.1734', name: 'Barcelona', country: 'España' },
      'tokio': { lat: '35.6762', lon: '139.6503', name: 'Tokio', country: 'Japón' },
      'tokyo': { lat: '35.6762', lon: '139.6503', name: 'Tokio', country: 'Japón' },
      'nueva york': { lat: '40.7128', lon: '-74.0060', name: 'Nueva York', country: 'Estados Unidos' },
      'new york': { lat: '40.7128', lon: '-74.0060', name: 'Nueva York', country: 'Estados Unidos' },
      'paris': { lat: '48.8566', lon: '2.3522', name: 'París', country: 'Francia' },
      'londres': { lat: '51.5074', lon: '-0.1278', name: 'Londres', country: 'Reino Unido' },
      'london': { lat: '51.5074', lon: '-0.1278', name: 'Londres', country: 'Reino Unido' },
      'roma': { lat: '41.9028', lon: '12.4964', name: 'Roma', country: 'Italia' },
      'berlin': { lat: '52.5200', lon: '13.4050', name: 'Berlín', country: 'Alemania' }
    };
    
    const fetchCities = async () => {
      try {
        const searchTerm = cityInput.toLowerCase().trim();
        let results = [];

        // Primero buscamos en nuestra lista de ciudades importantes
        const matchingImportantCities = Object.entries(importantCities)
          .filter(([key]) => key.includes(searchTerm))
          .map(([_, city]) => ({
            label: `${city.name}, ${city.country}`,
            value: {
              lat: city.lat,
              lon: city.lon,
              name: city.name,
              fullName: `${city.name}, ${city.country}`
            }
          }));

        if (matchingImportantCities.length > 0) {
          results = matchingImportantCities;
        }

        // Si no encontramos ciudades importantes o queremos complementar, buscamos en Nominatim
        const params = new URLSearchParams({
          q: cityInput,
          format: 'json',
          limit: 5,
          'accept-language': 'es'
        });

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?${params}`,
          { 
            signal: controller.signal,
            headers: {
              'Accept-Language': 'es'
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Procesamos los resultados de Nominatim
        const nominatimResults = data
          .filter(place => place.display_name)
          .map(place => {
            const parts = place.display_name.split(', ');
            const cityName = parts[0];
            const country = parts[parts.length - 1];

            return {
              label: `${cityName}, ${country}`,
              value: {
                lat: place.lat,
                lon: place.lon,
                name: cityName,
                fullName: `${cityName}, ${country}`
              }
            };
          });

        // Combinamos los resultados, priorizando las ciudades importantes
        results = [...new Map([
          ...matchingImportantCities.map(city => [city.value.name, city]),
          ...nominatimResults.map(city => [city.value.name, city])
        ]).values()];

        console.log('🔍 Resultados de búsqueda:', results.length, 'ciudades encontradas');
        setCityOptions(results);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('❌ Error buscando ciudades:', error);
        }
      }
    };

    // Reducimos el tiempo de espera
    const timeoutId = setTimeout(() => {
      fetchCities();
    }, 200); // Reducimos aún más el tiempo para ciudades importantes
    
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [cityInput]);

  // Manejar el cambio de ciudad
  const handleCityChange = async (selected) => {
    console.log('Ciudad seleccionada completa:', selected);
    
    if (selected && selected.value) {
      const { lat, lon, name } = selected.value;
      const timezone = inferTimezone(lat, lon);
      
      const newLocationData = {
        date: selectedDate.toISOString().split('T')[0],
        lat,
        lon,
        timezone,
        cityName: name
      };
      
      console.log('Enviando nuevos datos de ubicación:', newLocationData);
      setLocationData(newLocationData);
      setSelectedCity(selected);
      onDataChange(newLocationData);
    } else {
      // Cuando se limpia la selección, resetear los datos de ubicación
      console.log('Limpiando selección de ciudad');
      const newLocationData = {
        date: selectedDate.toISOString().split('T')[0],
        lat: null,
        lon: null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cityName: null
      };
      setLocationData(newLocationData);
      setSelectedCity(null);
      onDataChange(newLocationData);
    }
  };

  // Manejar cambio de fecha
  const handleDateChange = (date) => {
    console.log('📅 Fecha seleccionada:', date);
    setSelectedDate(date);
    
    // Formatear la fecha en YYYY-MM-DD
    const formattedDate = date.toISOString().split('T')[0];
    console.log('📅 Fecha formateada:', formattedDate);

    if (locationData) {
      const newData = {
        ...locationData,
        date: formattedDate
      };
      console.log('📅 Enviando nuevos datos con fecha:', newData);
      onDataChange(newData);
    } else {
      // Si no hay datos de ubicación, al menos enviamos la fecha
      const newData = {
        date: formattedDate,
        lat: null,
        lon: null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cityName: null
      };
      console.log('📅 Enviando datos iniciales con nueva fecha:', newData);
      onDataChange(newData);
    }
  };

  // Tema oscuro para react-select
  const selectTheme = theme => ({
    ...theme,
    colors: {
      ...theme.colors,
      neutral0: darkMode ? '#212529' : '#fff',
      neutral80: darkMode ? '#fff' : '#212529',
      primary25: darkMode ? '#343a40' : '#e9ecef',
      primary: '#0d6efd',
    },
  });

  return (
    <div style={{ backgroundColor: darkMode ? '#212529' : '#adb5bd', borderRadius: 12 }}>
      <Form className="mb-4 p-3">
        <Row className="g-3 align-items-end justify-content-center">
          <Col xs={12} md={5}>
            <Form.Group controlId="date-picker">
              <Form.Label>Fecha</Form.Label>
              <div>
                <DatePicker
                  id="date-picker"
                  selected={selectedDate}
                  onChange={handleDateChange}
                  dateFormat="dd/MM/yyyy"
                  className="form-control w-100"
                />
              </div>
            </Form.Group>
          </Col>
          <Col xs={12} md={7}>
            <Form.Group controlId="city-select">
              <Form.Label>Ciudad</Form.Label>
              <Select
                inputId="city-select"
                options={cityOptions}
                onInputChange={setCityInput}
                onChange={handleCityChange}
                value={selectedCity}
                placeholder="Buscar ciudad..."
                isClearable
                classNamePrefix="react-select"
                theme={selectTheme}
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>
    </div>
  );
}

export default DateLocationInput;
