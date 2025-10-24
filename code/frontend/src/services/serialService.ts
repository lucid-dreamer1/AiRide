// src/services/serialService.ts

// let writer: any = null;

// export async function connectSerial(): Promise<boolean> {
//   console.log("Simulazione connessione seriale attiva");
//   writer = {
//     write: async (msg: string) => console.log("Simulato invio seriale:", msg)
//   };
//   return true;
// }

// export async function sendSerialMessage(msg: string) {
//   if (!writer) throw new Error("Seriale non connessa");
//   await writer.write(msg + "\n");
// }

// export async function disconnectSerial() {
//   console.log("Simulazione disconnessione seriale");
//   writer = null;
// }
// -------------------------------------------------VERSIONE MOCK--------------------------------------------
let port: any = null;
let writer: any = null;

export async function connectSerial(): Promise<boolean> {
  console.log("Simulazione connessione seriale attiva");
  port = {}; // mock
  writer = {
    write: async (msg: string) => console.log("Simulato invio seriale:", msg),
  };
  return true;
}

export async function sendSerialMessage(msg: string) {
  if (!writer) throw new Error("Seriale non connessa");
  await writer.write(msg + "\n");
}
