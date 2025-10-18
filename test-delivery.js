// Script de prueba para la funcionalidad de delivery applications
import fetch from 'node-fetch'; // Asegúrate de instalar node-fetch si no está disponible

const BASE_URL = 'http://localhost:3000';

// Función para hacer login y obtener token
async function login() {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com', // Cambiar por un email que exista
        password: 'password123'     // Cambiar por la contraseña correcta
      })
    });

    const data = await response.json();
    console.log('Login response:', data);
    
    if (data.token) {
      return data.token;
    } else {
      console.error('No se pudo obtener el token');
      return null;
    }
  } catch (error) {
    console.error('Error en login:', error);
    return null;
  }
}

// Función para enviar solicitud de delivery
async function submitDeliveryApplication(token) {
  try {
    console.log('Enviando solicitud con token:', token.substring(0, 20) + '...');
    
    const response = await fetch(`${BASE_URL}/api/v1/delivery-applications/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    console.log('Delivery application response:', data);
    
    return data;
  } catch (error) {
    console.error('Error en delivery application:', error);
    return null;
  }
}

// Función principal de prueba
async function testDeliveryApplication() {
  console.log('=== PRUEBA DE DELIVERY APPLICATION ===');
  
  // 1. Hacer login
  console.log('1. Haciendo login...');
  const token = await login();
  
  if (!token) {
    console.error('No se pudo obtener el token. Verifica las credenciales.');
    return;
  }
  
  console.log('Login exitoso');
  
  // 2. Enviar solicitud de delivery
  console.log('2. Enviando solicitud de delivery...');
  const result = await submitDeliveryApplication(token);
  
  if (result && result.success) {
    console.log('Solicitud de delivery enviada exitosamente');
  } else {
    console.error('Error enviando solicitud de delivery:', result);
  }
}

// Ejecutar la prueba
testDeliveryApplication();