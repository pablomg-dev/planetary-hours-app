import Table from 'react-bootstrap/Table';
import Card from 'react-bootstrap/Card';

// Diccionario de nombres en español
const planetNamesES = {
  Sun: 'Sol',
  Moon: 'Luna',
  Mars: 'Marte',
  Mercury: 'Mercurio',
  Jupiter: 'Júpiter',
  Venus: 'Venus',
  Saturn: 'Saturno'
};

function PlanetaryHoursTable({ hoursData, darkMode }) {
  if (!hoursData || !hoursData.hours || hoursData.hours.length === 0) {
    return <p>No hay datos de horas planetarias para mostrar.</p>;
  }

  const { dayRuler, hours, city } = hoursData;

  // Estilos para fondo y texto
  const bgColor = darkMode ? '#212529' : '#adb5bd';
  const textColor = darkMode ? '#fff' : '#212529';
  const borderColor = '#373b3e';

  // Función para mostrar solo el nombre del regente
  const renderRegent = (regent) => (
    <>
      {planetNamesES[regent] || regent}
    </>
  );

  return (
    <Card
      className="my-4"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        border: darkMode ? 'none' : `1px solid ${borderColor}`
      }}
    >
      <Card.Body>
        {city && city.trim() !== '' && (
          <Card.Subtitle className="mb-4 text-center fs-5" style={{ color: textColor }}>
            Ciudad: <strong>{city}</strong>
          </Card.Subtitle>
        )}
        <p className="mb-4 text-center fs-4 fw-semibold" style={{ color: textColor }}>
          Regente del Día: <span className="fw-bold fs-4">
            {renderRegent(dayRuler)}
          </span>
        </p>
        <Table
          bordered
          hover
          responsive
          className="border-secondary text-center align-middle"
          style={{
            backgroundColor: bgColor,
            color: textColor,
            marginBottom: 0,
            borderColor: borderColor
          }}
        >
          <thead>
            <tr>
              <th className="border-secondary">Hora</th>
              <th className="border-secondary">Planeta</th>
              <th className="border-secondary">Inicio</th>
              <th className="border-secondary">Fin</th>
            </tr>
          </thead>
          <tbody>
            {hours.map((hour, index) => (
              <tr key={index}>
                <td className="border-secondary">{hour.hour}</td>
                <td className="border-secondary fw-bold">
                  {planetNamesES[hour.planet] || hour.planet}
                </td>
                <td className="border-secondary">{hour.start}</td>
                <td className="border-secondary">{hour.end}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

export default PlanetaryHoursTable;
