require('dotenv').config();
const readline = require('readline');
const { auth, db } = require('./firebaseAdmin');

const emailArg = process.argv[2];
const passwordArg = process.argv[3];

async function registrarAdmin(email, password) {
  try {
    console.log('\n⏳ Creando usuario en Firebase Authentication...');
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      emailVerified: true
    });

    console.log(`✅ Usuario creado en Auth con UID: ${userRecord.uid}`);

    console.log('⏳ Registrando datos en Firestore (colección "usuarios")...');
    await db.collection('usuarios').doc(userRecord.uid).set({
      nombre: 'Admin El Gustito',
      email: email,
      telefono: '11 2275-0551',
      rol: 'admin',
      activo: true,
      createdAt: new Date()
    });

    console.log(`
═══════════════════════════════════════════
🎉 ¡ADMINISTRADOR CREADO CON ÉXITO!
═══════════════════════════════════════════
📧 Email: ${email}
🔑 Contraseña: ${password}
🛡️ Rol: admin
═══════════════════════════════════════════
`);

  } catch (error) {
    console.error('❌ Error al crear el administrador:', error.message);
  }
}

if (emailArg && passwordArg) {
  if (!emailArg.includes('@')) {
    console.error('❌ Correo inválido.');
    process.exit(1);
  }
  if (passwordArg.length < 6) {
    console.error('❌ Contraseña demasiado corta (mínimo 6 caracteres).');
    process.exit(1);
  }
  registrarAdmin(emailArg, passwordArg).then(() => process.exit(0));
} else {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Introduzca correo electrónico del Administrador: ', (email) => {
    if (!email || !email.includes('@')) {
      console.error('❌ Correo inválido.');
      rl.close();
      process.exit(1);
    }

    rl.question('Introduzca contraseña (mínimo 6 caracteres): ', async (password) => {
      if (!password || password.length < 6) {
        console.error('❌ Contraseña demasiado corta (mínimo 6 caracteres).');
        rl.close();
        process.exit(1);
      }

      await registrarAdmin(email, password);
      rl.close();
    });
  });
}
