import { DateTime } from 'luxon';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import DateLocationInput from './components/DateLocationInput';
import PlanetaryHoursTable from './components/PlanetaryHoursTable';
import {
  Container,
  Row,
  Col,
  Alert,
  Spinner,
  Button
} from 'react-bootstrap';


function App() {
  // Inicializar el estado sin valores predeterminados
  const [apiParams, setApiParams] = useState({
    date: new Date().toISOString().split('T')[0],
    lat: null,
    lon: null,
    timezone: null,
    cityName: null
  });

  const [hoursData, setHoursData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Debug: Mostrar el estado actual
  useEffect(() => {
    console.log('Estado actual de apiParams:', apiParams);
  }, [apiParams]);

  // Detectar ubicación solo al cargar la app
  useEffect(() => {
    if (apiParams.lat && apiParams.lon) return; // Ya está seteado
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setApiParams((prev) => ({
            ...prev,
            lat: position.coords.latitude.toString(),
            lon: position.coords.longitude.toString(),
            timezone: DateTime.local().zoneName,
          }));
        },
        () => {
          // Si el usuario no permite, usa valores por defecto (ej: UTC)
          setApiParams((prev) => ({
            ...prev,
            lat: '-34.593',
            lon: '-58.742',
            timezone: 'America/Argentina/Buenos_Aires',
          }));
        }
      );
    }
  }, []);

  const handleDateLocationChange = useCallback((data) => {
    console.log('📍 Datos recibidos del selector:', data);
    
    // Validar que la fecha sea válida
    if (!data.date) {
      console.error('❌ No se recibió una fecha válida:', data);
      return;
    }

    // Si solo cambió la fecha, actualizamos todos los parámetros existentes con la nueva fecha
    if (!data.lat || !data.lon || !data.timezone) {
      console.log('📅 Actualizando fecha y manteniendo ubicación actual');
      setApiParams(prevParams => {
        if (!prevParams.lat || !prevParams.lon || !prevParams.timezone) {
          console.warn('⚠️ No hay datos de ubicación previos');
          return prevParams;
        }
        const newParams = {
          ...prevParams,
          date: data.date
        };
        console.log('📅 Parámetros actualizados con nueva fecha:', newParams);
        return newParams;
      });
      return;
    }

    // Si tenemos datos completos, actualizamos todo
    setApiParams(prevParams => {
      const newParams = {
        ...prevParams,
        ...data,
        lat: String(data.lat),
        lon: String(data.lon),
        date: data.date
      };
      console.log('📍 Parámetros actualizados completos:', newParams);
      return newParams;
    });
  }, []);

  // Efecto para cargar los datos de horas planetarias
  useEffect(() => {
    const fetchPlanetaryHours = async () => {
      if (!apiParams.lat || !apiParams.lon || !apiParams.timezone || !apiParams.date) {
        console.warn('⚠️ Faltan parámetros necesarios:', apiParams);
        return;
      }

      try {
        setLoading(true);
        const url = '/api/planetary-hours';
        const params = {
          ...apiParams,
          date: apiParams.date // Asegurarnos de que la fecha esté incluida
        };

        console.log('🌍 Realizando petición al backend:', {
          fecha: params.date,
          timezone: params.timezone,
          coordenadas: `${params.lat},${params.lon}`,
          ciudad: params.cityName
        });
        
        const response = await axios.get(url, { 
          params,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data) {
          console.log('✅ Datos recibidos del backend:', {
            regenteDia: response.data.dayRuler,
            fecha: params.date,
            cantidadHoras: response.data.hours?.length
          });
          setHoursData(response.data);
          setError(null);
        } else {
          throw new Error('No se recibieron datos del servidor');
        }
      } catch (err) {
        console.error('❌ Error al obtener datos:', err.response?.data || err.message);
        setError(err?.response?.data?.error || 'Error al obtener datos');
        setHoursData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanetaryHours();
  }, [apiParams]);

  // Actualiza la hora actual cada segundo
  useEffect(() => {
    const updateCurrentTime = () => {
      if (!apiParams.timezone) {
        console.log('No hay zona horaria definida');
        return;
      }

      try {
        // Intentar crear un DateTime con la zona horaria especificada
        const now = DateTime.now().setZone(apiParams.timezone);
        console.log('Actualizando hora para zona horaria:', apiParams.timezone);
        
        if (now.isValid) {
          const timeStr = now.toFormat('HH:mm:ss');
          console.log('Nueva hora calculada:', timeStr, 'para zona:', apiParams.timezone);
          setCurrentTime(timeStr);
        } else {
          console.error('DateTime inválido para zona:', apiParams.timezone);
          setCurrentTime('--:--:--');
        }
      } catch (error) {
        console.error('Error al actualizar la hora:', error, 'para zona:', apiParams.timezone);
        setCurrentTime('--:--:--');
      }
    };

    // Actualizar inmediatamente y luego cada segundo
    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 1000);
    
    // Limpiar el intervalo al desmontar o cuando cambie la zona horaria
    return () => clearInterval(interval);
  }, [apiParams.timezone]);

  // Aplica el tema al body
  useEffect(() => {
    document.body.setAttribute('data-bs-theme', darkMode ? 'dark' : 'light');
    document.body.style.backgroundColor = darkMode ? '#212529' : '#adb5bd'; // Gris oscuro en modo claro
    return () => {
      document.body.removeAttribute('data-bs-theme');
      document.body.style.backgroundColor = '';
    };
  }, [darkMode]);

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <div className="d-flex justify-content-end mb-3">
            <Button
              variant={darkMode ? "secondary" : "outline-secondary"}
              onClick={() => setDarkMode(dm => !dm)}
            >
              {darkMode ? "Modo Claro" : "Modo Oscuro"}
            </Button>
          </div>
          <h1 className="text-center mb-4">Calculadora de Horas Planetarias</h1>
          <h5 className="text-center mb-3">
            Hora actual{apiParams.cityName ? ` en ${apiParams.cityName}` : ''}: <span style={{ fontFamily: 'monospace' }}>{currentTime}</span>
          </h5>
          <DateLocationInput onDataChange={handleDateLocationChange} darkMode={darkMode} />
          {loading && (
            <div className="d-flex justify-content-center my-4">
              <Spinner animation="border" role="status" />
              <span className="ms-2">Cargando horas planetarias...</span>
            </div>
          )}
          {error && (
            <Alert variant="danger" className="my-3 text-center">
              {error}
            </Alert>
          )}
          {!loading && !error && hoursData && (
            <PlanetaryHoursTable hoursData={hoursData} darkMode={darkMode} />
          )}
          {!loading && !error && !hoursData && (
            <Alert variant="info" className="text-center mt-4">
              Selecciona una fecha y ubicación para calcular las horas planetarias.
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default App;
