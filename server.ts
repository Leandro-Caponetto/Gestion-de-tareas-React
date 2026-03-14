import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import { jsPDF } from "jspdf";
import dotenv from "dotenv";

// 1. Cargar configuración del archivo .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json());

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // --- ENDPOINT DE AUTOMATIZACIÓN (PDF + EMAIL) ---
  app.post("/api/automate-tasks", async (req, res) => {
    const { tasks, userEmail } = req.body;

    try {
      // 1. Generar el PDF con jsPDF
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.setTextColor(0, 82, 155); // Azul Correo
      doc.text("Registro de Tareas - Correo Argentino", 20, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generado el: ${new Date().toLocaleString()}`, 20, 28);
      doc.text("----------------------------------------------------------", 20, 33);

      let y = 45;
      doc.setTextColor(0);
      tasks.forEach((task: any, index: number) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.setFont("helvetica", "bold");
        doc.text(`${index + 1}. [${task.estado}] ${task.proyecto}`, 20, y);
        doc.setFont("helvetica", "normal");
        doc.text(`   Descripción: ${task.descripcion || task.tarea || 'Sin descripción'}`, 20, y + 5);
        y += 15;
      });

      // 2. Configurar el Mailer con variables de entorno
      const gmailUser = process.env.GMAIL_USER || "caponettopeppers@gmail.com";
      const gmailPass = process.env.GMAIL_APP_PASSWORD;

      if (!gmailPass) {
        return res.json({ 
          success: false, 
          error: "Falta configurar GMAIL_APP_PASSWORD",
          pdfData: doc.output("datauristring") 
        });
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: gmailUser, pass: gmailPass }
      });

      // 3. Diseño Profesional del Email (HTML/CSS)
      const targetEmail = userEmail || "caponettopeppers@gmail.com";
      const mailOptions = {
        from: `"Asistente Correo Argentino" <${gmailUser}>`,
        to: targetEmail,
        subject: "✅ Reporte de Jornada - Correo Argentino",
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .container { font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden; }
            .header { background-color: #00529b; padding: 25px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 24px; text-transform: uppercase; }
            .yellow-bar { background-color: #ffce00; height: 6px; }
            .content { padding: 30px; background-color: #ffffff; }
            .badge { background-color: #dcfce7; color: #166534; padding: 6px 12px; border-radius: 20px; font-weight: bold; font-size: 12px; display: inline-block; margin-bottom: 20px; }
            .summary-box { background-color: #f8fafc; border-left: 4px solid #00529b; padding: 15px; margin: 20px 0; font-size: 14px; }
            .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 11px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header"><h1>Correo Argentino</h1></div>
            <div class="yellow-bar"></div>
            <div class="content">
              <div class="badge">PROCESO EXITOSO</div>
              <h2 style="color: #00529b;">¡Gestión Finalizada!</h2>
              <p>Hola, Leandro. Tu asistente de IA ha completado las tareas y el registro de horas del día.</p>
              
              <div class="summary-box">
                <strong>Resumen de Operación:</strong><br>
                • Estado de tareas actualizado a: <b>Done</b><br>
                • Carga de horas: <b>8.0 Horas</b><br>
                • Documento: <b>PDF Adjunto</b>
              </div>

              <p>Puedes encontrar el detalle completo de los movimientos en el archivo adjunto.</p>
              <p style="margin-top: 30px;"><b>Saludos,<br>Asistente Virtual</b></p>
            </div>
            <div class="footer">
              © ${new Date().getFullYear()} Correo Argentino S.A. - Este es un aviso automático de sistema.
            </div>
          </div>
        </body>
        </html>
        `,
        attachments: [
          {
            filename: `Reporte_${new Date().toISOString().split('T')[0]}.pdf`,
            content: Buffer.from(doc.output("arraybuffer"))
          },
        ],
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: "Email enviado con éxito" });

    } catch (error: any) {
      console.error("Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // --- LÓGICA DE SOCKET.IO Y SALAS ---
  const rooms: any = {};
  io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId, displayName, avatarUrl) => {
      socket.join(roomId);
      if (!rooms[roomId]) rooms[roomId] = {};
      rooms[roomId][socket.id] = { userId, displayName, socketId: socket.id, avatarUrl };
      
      socket.to(roomId).emit("user-connected", userId, displayName, socket.id, avatarUrl);
      
      socket.on("disconnect", () => {
        if (rooms[roomId]) delete rooms[roomId][socket.id];
        socket.to(roomId).emit("user-disconnected", userId);
      });
    });

    socket.on("send-message", (data) => io.to(data.roomId).emit("new-message", data));
    socket.on("typing", (data) => socket.to(data.roomId).emit("typing", data));

    // WebRTC Signaling
    socket.on("offer", (data) => io.to(data.target).emit("offer", { offer: data.offer, sender: socket.id }));
    socket.on("answer", (data) => io.to(data.target).emit("answer", { answer: data.answer, sender: socket.id }));
    socket.on("ice-candidate", (data) => io.to(data.target).emit("ice-candidate", { candidate: data.candidate, sender: socket.id }));
  });

  // --- CONFIGURACIÓN DE VITE / PRODUCCIÓN ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor Correo Argentino corriendo en el puerto ${PORT}`);
  });
}

startServer();