import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { Form, Row, Col } from 'react-bootstrap';
import 'react-datepicker/dist/react-datepicker.css';


function DateLocationInput({ onDataChange, darkMode }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [latitude, setLatitude] = useState('-34.593');
  const [longitude, setLongitude] = useState('-58.742');
  const [timezone, setTimezone] = useState('America/Argentina/Buenos_Aires');
  const [cityOptions, setCityOptions] = useState([]);
  const [cityInput, setCityInput] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);

  // Buscar ciudades en Nominatim
  useEffect(() => {
    if (cityInput.length < 3) return;
    const controller = new AbortController();
    fetch(
      `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(cityInput)}&format=json&addressdetails=1&limit=5`,
      { signal: controller.signal, headers: { 'Accept-Language': 'es' } }
    )
      .then(res => res.json())
      .then(data => {
        setCityOptions(
          data.map(city => ({
            label: `${city.address.city || city.address.town || city.address.village || city.address.state || city.address.county} (${city.address.state || city.address.region || ''}, ${city.address.country})`,
            value: city,
          }))
        );
      })
      .catch(() => {});
    return () => controller.abort();
  }, [cityInput]);

  // Cuando se selecciona una ciudad, actualiza lat/lon y busca zona horaria
  useEffect(() => {
    if (selectedCity) {
      setLatitude(selectedCity.value.lat);
      setLongitude(selectedCity.value.lon);

      // Buscar zona horaria usando GeoNames
      fetch(
        `https://secure.geonames.org/timezoneJSON?lat=${selectedCity.value.lat}&lng=${selectedCity.value.lon}&username=demo`
      )
        .then(res => res.json())
        .then(data => {
          if (data.timezoneId) setTimezone(data.timezoneId);
        })
        .catch(() => {});
    }
  }, [selectedCity]);

  useEffect(() => {
    // Formatear la fecha a YYYY-MM-DD para el backend
    const formattedDate = selectedDate ? selectedDate.toISOString().split('T')[0] : '';
    
    // Llama a la función prop `onDataChange` para enviar los datos al padre
    onDataChange({
      date: formattedDate,
      lat: latitude,
      lon: longitude,
      timezone: timezone, // el de la ciudad seleccionada
      cityName: selectedCity ? selectedCity.label : undefined
    });
  }, [selectedDate, latitude, longitude, timezone, onDataChange, selectedCity]); // Dependencias del useEffect

  // Tema oscuro para react-select
  const selectTheme = theme => ({
    ...theme,
    colors: {
      ...theme.colors,
      neutral0: darkMode ? '#212529' : '#fff',      // Fondo del input
      neutral80: darkMode ? '#fff' : '#212529',     // Texto
      primary25: darkMode ? '#343a40' : '#e9ecef',  // Hover opción ? '#343a40' : '#e9ecef',  // Hover opción
      primary: '#0d6efd',                           // Color primario Bootstrap                    // Color primario Bootstrap
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
                  onChange={date => setSelectedDate(date)}
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
                onChange={setSelectedCity}
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
