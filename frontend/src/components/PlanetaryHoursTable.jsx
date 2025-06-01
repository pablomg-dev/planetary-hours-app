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

  const tableStyles = {
    backgroundColor: `${bgColor} !important`,
    color: `${textColor} !important`,
    marginBottom: 0,
    borderColor: darkMode ? '#373b3e' : undefined
  };

  const cellStyles = {
    backgroundColor: `${bgColor} !important`,
    color: `${textColor} !important`,
    borderColor: darkMode ? '#373b3e' : undefined
  };

  return (
    <Card
      className="my-4"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        border: darkMode ? 'none' : '1px solid rgba(0,0,0,.125)' // Opcional: quitar borde en modo oscuro
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
          style={tableStyles}
        >
          <thead>
            <tr>
              <th style={cellStyles}>Hora</th>
              <th style={cellStyles}>Planeta</th>
              <th style={cellStyles}>Inicio</th>
              <th style={cellStyles}>Fin</th>
            </tr>
          </thead>
          <tbody>
            {hours.map((hour, index) => (
              <tr key={index}>
                <td style={cellStyles}>{hour.hour}</td>
                <td style={cellStyles}>{planetNamesES[hour.planet] || hour.planet}</td>
                <td style={cellStyles}>{hour.start}</td>
                <td style={cellStyles}>{hour.end}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

export default PlanetaryHoursTable;
