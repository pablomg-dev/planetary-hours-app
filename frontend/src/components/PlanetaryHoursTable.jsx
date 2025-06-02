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

  const { dayRuler, hours, city } = hoursData;

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
        {city && (
          <Card.Subtitle className="mb-2 text-muted text-center" style={{ color: textColor }}>
            Ciudad: <strong>{city}</strong>
          </Card.Subtitle>
        )}
        <p className="mb-3 text-center" style={{ color: textColor }}>
          Regente del Día: <strong>
            {planetNamesES[dayRuler] || dayRuler}
            {' '}
            <span style={{
              fontSize: '1.7em',
              verticalAlign: '-0.15em',  // Cambiado de -0.25em a -0.15em
              display: 'inline-block',   // Cambiado de inline a inline-block
              lineHeight: '1',
              marginLeft: '0.1em'        // Agregado un pequeño margen
            }}>
              {planetSymbols[dayRuler]}
            </span>
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
