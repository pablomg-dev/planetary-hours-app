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
  const [apiParams, setApiParams] = useState({
    date: new Date().toISOString().split('T')[0],
    lat: null,
    lon: null,
    timezone: DateTime.local().zoneName,
  });
  const [hoursData, setHoursData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(DateTime.local().setZone(apiParams.timezone).toFormat('HH:mm:ss'));

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
            timezone: 'UTC',
          }));
        }
      );
    }
  }, []);

  const handleDateLocationChange = useCallback((data) => {
    setApiParams(data); // Usa directamente el objeto recibido
  }, []);

  useEffect(() => {
    if (apiParams.lat && apiParams.lon && apiParams.timezone && apiParams.date) {
      setLoading(true);
      axios.get('/api/planetary-hours', { params: apiParams })
        .then(res => setHoursData(res.data))
        .catch(err => setError(err?.response?.data?.error || 'Error al obtener datos'))
        .finally(() => setLoading(false));
    }
  }, [apiParams]);

  // Actualiza la hora actual cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(DateTime.local().setZone(apiParams.timezone).toFormat('HH:mm:ss'));
    }, 1000);
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
            Hora actual en tu zona: <span style={{ fontFamily: 'monospace' }}>{currentTime}</span>
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
            <PlanetaryHoursTable hoursData={hoursData} />
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
