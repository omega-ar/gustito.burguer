require('dotenv').config();
const { auth, db } = require('./firebaseAdmin');

const usersToInit = [
  {
    email: 'admin@elgustito.com',
    password: 'Fresa890',
    nombre: 'Admin El Gustito',
    rol: 'admin',
    telefono: '11 2275-0551'
  },
  {
    email: 'cajero1@elgustito.com',
    password: 'MMMXXVV',
    nombre: 'Cajero 1',
    rol: 'cajero',
    telefono: '11 2275-0551'
  }
];

async function initUsers() {
  console.log('🚀 Inicializando usuarios en Firebase...');
  
  for (const userData of usersToInit) {
    let uid = null;
    
    try {
      const userRecord = await auth.getUserByEmail(userData.email);
      uid = userRecord.uid;
      console.log(`ℹ️ El usuario ${userData.email} ya existe. Actualizando contraseña...`);
      
      await auth.updateUser(uid, {
        password: userData.password
      });
      console.log(`✅ Contraseña actualizada para ${userData.email}`);
      
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log(`⏳ Creando nuevo usuario ${userData.email}...`);
        const newUser = await auth.createUser({
          email: userData.email,
          password: userData.password,
          emailVerified: true
        });
        uid = newUser.uid;
        console.log(`✅ Usuario creado en Auth con UID: ${uid}`);
      } else {
        console.error(`❌ Error al buscar/crear usuario ${userData.email}:`, error.message);
        continue;
      }
    }

    try {
      console.log(`⏳ Sincronizando datos de ${userData.email} en Firestore...`);
      await db.collection('usuarios').doc(uid).set({
        nombre: userData.nombre,
        email: userData.email,
        telefono: userData.telefono,
        rol: userData.rol,
        activo: true,
        updatedAt: new Date()
      }, { merge: true });
      console.log(`✅ Datos sincronizados correctamente para ${userData.email}\n`);
    } catch (fsError) {
      console.error(`❌ Error en Firestore para ${userData.email}:`, fsError.message);
    }
  }
  
  console.log('🎉 ¡Proceso de inicialización de usuarios terminado!');
  process.exit(0);
}

initUsers();
