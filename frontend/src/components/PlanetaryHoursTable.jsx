import Table from 'react-bootstrap/Table';
import Card from 'react-bootstrap/Card';

// Diccionario de traducción inglés -> español
const planetNamesES = {
  Sun: 'Sol',
  Moon: 'Luna',
  Mars: 'Marte',
  Mercury: 'Mercurio',
  Jupiter: 'Júpiter',
  Venus: 'Venus',
  Saturn: 'Saturno'
};

const planetSymbols = {
  Sun: '☉',
  Moon: '☽',
  Mars: '♂',
  Mercury: '☿',
  Jupiter: '♃',
  Venus: '♀',
  Saturn: '♄'
};

function PlanetaryHoursTable({ hoursData, darkMode }) {
  // Verificación básica para asegurar que tenemos datos antes de renderizar
  if (!hoursData || !hoursData.hours || hoursData.hours.length === 0) {
    return <p>No hay datos de horas planetarias para mostrar.</p>;
  }

  const { dayRuler, nextDayRuler, hours, city, currentPlanetaryDay } = hoursData;

  // Obtener la hora del amanecer (primera hora del día)
  const sunrise = currentPlanetaryDay?.start || hours[0]?.start;
  const nextSunrise = currentPlanetaryDay?.end;
  const isBeforeSunrise = currentPlanetaryDay?.isBeforeSunrise;

  // Estilos para fondo y texto
  const bgColor = darkMode ? '#212529' : '#adb5bd';
  const textColor = darkMode ? '#fff' : '#212529';
  const borderColor = '#373b3e'; // Mismo color de borde para ambos modos

  const tableStyles = {
    backgroundColor: `${bgColor} !important`,
    color: `${textColor} !important`,
    marginBottom: 0,
    borderColor: `${borderColor} !important`
  };

  const cellStyles = {
    backgroundColor: `${bgColor} !important`,
    color: `${textColor} !important`,
    borderColor: `${borderColor} !important`
  };

  // Estilo para el texto del amanecer
  const infoStyle = {
    fontSize: '0.9em',
    color: darkMode ? '#adb5bd' : '#666',
    marginBottom: '0.5rem'
  };

  // Función para mostrar el regente con su símbolo
  const renderRegent = (regent) => (
    <>
      {planetNamesES[regent] || regent}
      {' '}
      <span style={{
        fontSize: '1.2em',
        verticalAlign: '-0.1em',
        display: 'inline-block',
        lineHeight: '1',
        marginLeft: '0.1em'
      }}>
        {planetSymbols[regent]}
      </span>
    </>
  );

  return (
    <Card
      className="my-4"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        border: darkMode ? 'none' : `1px solid ${borderColor}` // Opcional: quitar borde en modo oscuro
      }}
    >
      <Card.Body>
        {city && city.trim() !== '' && (
          <Card.Subtitle className="mb-2 text-muted text-center" style={{ color: textColor }}>
            Ciudad: <strong>{city}</strong>
          </Card.Subtitle>
        )}
        <p className="mb-2 text-center" style={{ color: textColor }}>
          Regente del Día: <strong>
            {renderRegent(dayRuler)}
          </strong>
        </p>
        <Table
          bordered
          hover
          responsive
          className="border-secondary"
          style={tableStyles}
        >
          <thead>
            <tr>
              <th className="border-secondary" style={cellStyles}>Hora</th>
              <th className="border-secondary" style={cellStyles}>Planeta</th>
              <th className="border-secondary" style={cellStyles}>Inicio</th>
              <th className="border-secondary" style={cellStyles}>Fin</th>
            </tr>
          </thead>
          <tbody>
            {hours.map((hour, index) => (
              <tr key={index}>
                <td className="border-secondary" style={cellStyles}>{hour.hour}</td>
                <td className="border-secondary" style={cellStyles}>{planetNamesES[hour.planet] || hour.planet}</td>
                <td className="border-secondary" style={cellStyles}>{hour.start}</td>
                <td className="border-secondary" style={cellStyles}>{hour.end}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

export default PlanetaryHoursTable;
