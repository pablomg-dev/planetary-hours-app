import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { Form, Row, Col } from 'react-bootstrap';
import { DateTime } from 'luxon';
import 'react-datepicker/dist/react-datepicker.css';

interface Props {
    onDataChange: (data: any) => void;
}

const DateLocationInput: React.FC<Props> = ({ onDataChange }) => {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [cityOptions, setCityOptions] = useState<any[]>([]);
    const [cityInput, setCityInput] = useState('');
    const [selectedCity, setSelectedCity] = useState<any>(null);

    const inferTimezone = (lat: string, lon: string): string => {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    };

    useEffect(() => {
        if (cityInput.length < 3) return;

        const fetchCities = async () => {
            try {
                const response = await fetch(
                    `http://localhost:5000/api/locations/search?q=${encodeURIComponent(cityInput)}`
                );
                const options = await response.json();
                setCityOptions(options || []);
            } catch (error) {
                console.error('Error fetching cities:', error);
            }
        };

        const timer = setTimeout(fetchCities, 500);
        return () => clearTimeout(timer);
    }, [cityInput]);

    const handleCityChange = (selected: any) => {
        setSelectedCity(selected);
        if (selected) {
            onDataChange({
                date: DateTime.fromJSDate(selectedDate).toISODate(),
                ...selected.value
            });
        }
    };

    const handleDateChange = (date: Date | null) => {
        if (date) {
            setSelectedDate(date);
            if (selectedCity) {
                onDataChange({
                    date: DateTime.fromJSDate(date).toISODate(),
                    ...selectedCity.value
                });
            }
        }
    };

    return (
        <div className="glass-card mb-4">
            <Form>
                <Row className="g-4 align-items-center">
                    <Col md={12} lg={4}>
                        <Form.Group className="d-flex flex-column">
                            <Form.Label className="text-secondary small text-uppercase fw-bold mb-2">
                                📅 Seleccionar Fecha
                            </Form.Label>
                            <DatePicker
                                selected={selectedDate}
                                onChange={handleDateChange}
                                dateFormat="dd/MM/yyyy"
                                className="form-control bg-dark text-white border-secondary h-100"
                                containerClassName="w-100"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={12} lg={8}>
                        <Form.Group className="d-flex flex-column">
                            <Form.Label className="text-secondary small text-uppercase fw-bold mb-2">
                                🔍 Búsqueda de Ciudad
                            </Form.Label>
                            <Select
                                options={cityOptions}
                                onInputChange={setCityInput}
                                onChange={handleCityChange}
                                value={selectedCity}
                                placeholder="Ej: Madrid, España"
                                classNamePrefix="react-select"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        backgroundColor: '#0f172a',
                                        borderColor: 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        minHeight: '45px',
                                        borderRadius: '8px'
                                    }),
                                    menu: (base) => ({ ...base, backgroundColor: '#1e293b' }),
                                    option: (base, state) => ({
                                        ...base,
                                        backgroundColor: state.isFocused ? '#334155' : 'transparent',
                                        color: 'white'
                                    }),
                                    singleValue: (base) => ({ ...base, color: 'white' }),
                                    input: (base) => ({ ...base, color: 'white' })
                                }}
                            />
                        </Form.Group>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default DateLocationInput;
