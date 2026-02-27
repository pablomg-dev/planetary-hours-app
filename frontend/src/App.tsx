import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import DateLocationInput from './components/DateLocationInput';
import PlanetaryHoursTable from './components/PlanetaryHoursTable';
import { useClock } from './hooks/useClock';
import { useGeolocation } from './hooks/useGeolocation';
import type { ApiParams, PlanetaryHoursResponse } from './types';
import { DateTime } from 'luxon';

const DEFAULT_LOCATION = {
    lat: '-34.593',
    lon: '-58.742',
    timezone: 'America/Argentina/Buenos_Aires'
};

function App() {
    const [apiParams, setApiParams] = useState<ApiParams>({
        date: DateTime.now().toISODate()!,
        lat: null,
        lon: null,
        timezone: null,
        cityName: null
    });

    const [hoursData, setHoursData] = useState<PlanetaryHoursResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const currentTime = useClock(apiParams.timezone);
    const geoLoc = useGeolocation(DEFAULT_LOCATION);

    // Set initial geolocation
    useEffect(() => {
        if (geoLoc.lat && !apiParams.lat) {
            setApiParams(prev => ({ ...prev, ...geoLoc }));
        }
    }, [geoLoc]);

    const fetchPlanetaryHours = useCallback(async (params: ApiParams) => {
        if (!params.lat || !params.lon || !params.timezone) return;

        try {
            setLoading(true);
            const response = await axios.get<PlanetaryHoursResponse>('http://localhost:5000/api/hours', { params });
            setHoursData(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al obtener datos');
            setHoursData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlanetaryHours(apiParams);
    }, [apiParams, fetchPlanetaryHours]);

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col lg={10} xl={8}>
                    <header className="mb-5 text-center">
                        <h1 className="display-4 fw-bold mb-2">Horas Planetarias</h1>
                        <p className="text-secondary lead">
                            Explora las energías caldeas del cosmos
                        </p>
                        <div className="d-flex justify-content-center mt-4">
                            <div className="badge bg-primary px-4 py-3 shadow-lg" style={{
                                fontFamily: 'Outfit, sans-serif',
                                fontSize: '1.25rem',
                                borderRadius: '12px',
                                background: 'var(--primary-gradient)'
                            }}>
                                {currentTime}
                            </div>
                        </div>
                    </header>

                    <DateLocationInput onDataChange={(data) => setApiParams(prev => ({ ...prev, ...data }))} />

                    {loading && (
                        <div className="text-center my-5">
                            <Spinner animation="grow" variant="primary" />
                            <p className="mt-3 text-secondary">Consultando las estrellas...</p>
                        </div>
                    )}

                    {error && <Alert variant="danger" className="glass-card text-danger">{error}</Alert>}

                    {hoursData && <PlanetaryHoursTable hoursData={hoursData} />}
                </Col>
            </Row>
        </Container>
    );
}

export default App;
