import React from 'react';
import Table from 'react-bootstrap/Table';
import type { PlanetaryHoursResponse } from '../types';

const planetNamesES: Record<string, string> = {
    Sun: 'Sol',
    Moon: 'Luna',
    Mars: 'Marte',
    Mercury: 'Mercurio',
    Jupiter: 'Júpiter',
    Venus: 'Venus',
    Saturn: 'Saturno'
};

const planetSymbols: Record<string, string> = {
    Sun: '☉',
    Moon: '☽',
    Mars: '♂',
    Mercury: '☿',
    Jupiter: '♃',
    Venus: '♀',
    Saturn: '♄'
};

interface Props {
    hoursData: PlanetaryHoursResponse;
}

const PlanetaryHoursTable: React.FC<Props> = ({ hoursData }) => {
    const { hours, dayRuler } = hoursData;

    return (
        <div className="glass-card mt-4">
            <div className="text-center mb-4">
                <span className="text-secondary d-block mb-1">Regente del Día</span>
                <h2 className="mb-0">
                    <span className="planet-symbol">{planetSymbols[dayRuler]}</span>
                    {planetNamesES[dayRuler] || dayRuler}
                </h2>
            </div>

            <Table responsive hover className="mb-0">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Planeta</th>
                        <th>Inicio</th>
                        <th>Fin</th>
                    </tr>
                </thead>
                <tbody>
                    {hours.map((hour) => (
                        <tr key={`${hour.type}-${hour.hour}`}>
                            <td>{hour.hour}</td>
                            <td className="fw-semibold">
                                <span className="planet-symbol me-2">{planetSymbols[hour.planet]}</span>
                                {planetNamesES[hour.planet] || hour.planet}
                            </td>
                            <td className="text-secondary">{hour.start}</td>
                            <td className="text-secondary">{hour.end}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default PlanetaryHoursTable;
