export const emailConfirmTemplate = (name: string, email: string, code: string) => `
<!DOCTYPE html>
<html lang="pt-BR">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmação de Email</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Arial', sans-serif;
      background-color: #f6f9fc;
      color: #333;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }

    .container {
      max-width: 600px;
      padding: 30px;
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      text-align: center;
    }

    h1 {
      font-size: 28px;
      color: #333;
      margin-bottom: 20px;
    }

    p {
      font-size: 16px;
      line-height: 1.6;
      color: #555;
      margin-bottom: 15px;
    }

    .code-container {
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 20px;
      margin-top: 30px;
      font-size: 36px;
      font-weight: bold;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .instructions {
      font-size: 14px;
      color: #888;
      margin-top: 20px;
    }

    .footer {
      font-size: 14px;
      color: #888;
      margin-top: 30px;
    }

    .footer a {
      color: #335ef7;
      text-decoration: none;
    }

    .footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>

<body>
  <div class="container">
    <h1>Confirme seu endereço de e-mail</h1>
    <p>Olá ${name},</p>
    <p>Para começar a usar o Mooby Sports, precisamos confirmar que o endereço de e-mail <strong>${email}</strong> é seu.</p>
    <div class="code-container">${code}</div>
    <p class="instructions">Utilize este código para confirmar seu endereço de e-mail.</p>
    <p class="instructions">Se o código não estiver visível, copie e cole manualmente em seu navegador.</p>
    <p class="footer">Atenciosamente,<br>Equipe Mooby Sports</p>
  </div>
</body>

</html>
`;
