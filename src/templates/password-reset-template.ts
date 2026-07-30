export const passwordTemplate = (url: string, name: string) => `
<!DOCTYPE html>
<html lang="pt-BR" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Redefinição de senha - MadeCoders</title>
<!--[if mso]>
<noscript>
<xml>
<o:OfficeDocumentSettings>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
</noscript>
<style>
  table {border-collapse: collapse;}
  td, th, div, p, a, h1 {font-family: Arial, sans-serif;}
</style>
<![endif]-->
<style>
  body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
  body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; background-color: #f2f1fb; }

  a { color: #5b4bf5; }

  @media screen and (max-width: 620px) {
    .email-container { width: 100% !important; }
    .fluid-padding { padding-left: 24px !important; padding-right: 24px !important; }
    .stack-footer { display: block !important; width: 100% !important; text-align: center !important; }
    .stack-footer .social-td { text-align: center !important; padding-top: 16px; }
  }
</style>
</head>
<body style="margin:0; padding:0; background-color:#f2f1fb;">
  <!-- Preheader (texto de pré-visualização oculto) -->
  <div style="display:none; max-height:0; overflow:hidden; mso-hide:all;">
    Solicitamos a redefinição de senha da sua conta MadeCoders. Clique para continuar.
  </div>

  <center style="width:100%; background-color:#f2f1fb;">
  <div style="max-width:620px; margin:0 auto;" class="email-container">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px; margin:0 auto;" class="email-container">

      <!-- Logo -->
      <tr>
        <td align="center" style="padding:40px 20px 30px 20px;">
          <span style="font-size:34px; font-weight:800; letter-spacing:-1px; font-family:Arial, Helvetica, sans-serif;">
            <span style="color:#5b4bf5;">&lt;</span><span style="color:#1a1a2e;">Made</span><span style="color:#5b4bf5;">Coders/&gt;</span>
          </span>
        </td>
      </tr>

      <!-- Card principal -->
      <tr>
        <td style="background-color:#ffffff; border-radius:18px; padding:0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">

            <!-- Ícone -->
            <tr>
              <td align="center" class="fluid-padding" style="padding:50px 50px 0 50px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="80" height="80" align="center" valign="middle" style="background-color:#f1effe; border-radius:20px; font-size:32px; line-height:80px;">
                      &#128274;
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Título -->
            <tr>
              <td align="center" class="fluid-padding" style="padding:20px 50px 0 50px;">
                <h1 style="margin:0; font-size:28px; line-height:34px; color:#14142b; font-family:Arial, Helvetica, sans-serif;">Redefinição de senha</h1>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:12px 0 30px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                  <td width="50" height="4" style="background-color:#5b4bf5; border-radius:2px; font-size:1px; line-height:1px;">&nbsp;</td>
                </tr></table>
              </td>
            </tr>

            <!-- Texto -->
            <tr>
              <td class="fluid-padding" style="padding:0 50px; font-family:Arial, Helvetica, sans-serif; font-size:16px; line-height:26px; color:#2c2c40;">
                <p style="margin:0 0 16px 0;">Olá, <strong style="color:#5b4bf5;">${name}</strong>!</p>
                <p style="margin:0 0 16px 0;">Recebemos uma solicitação para redefinir a senha da sua conta <strong style="color:#5b4bf5;">MadeCoders</strong>.</p>
                <p style="margin:0 0 30px 0;">Para continuar, clique no botão abaixo.</p>
              </td>
            </tr>

            <!-- Botão (bulletproof) -->
            <tr>
              <td align="center" style="padding:0 50px 30px 50px;">
                <!--[if mso]>
                <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="#" style="height:56px;v-text-anchor:middle;width:260px;" arcsize="20%" strokecolor="#5142e8" fillcolor="#5b4bf5">
                <w:anchorlock/>
                <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:17px;font-weight:bold;">&#128274; Redefinir senha</center>
                </v:roundrect>
                <![endif]-->
                <!--[if !mso]><!-- -->
                <a href="${url}" target="_blank"
                   style="background-color:#5b4bf5; background-image:linear-gradient(90deg,#6d5bf7,#5142e8); color:#ffffff; display:inline-block; font-family:Arial, Helvetica, sans-serif; font-size:17px; font-weight:bold; line-height:56px; text-align:center; text-decoration:none; border-radius:12px; width:260px;">
                  Redefinir senha
                </a>
                <!--<![endif]-->
              </td>
            </tr>

            <!-- Divisor "ou" -->
            <tr>
              <td class="fluid-padding" style="padding:0 50px 24px 50px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-top:1px solid #e5e3f5; width:45%;">&nbsp;</td>
                    <td align="center" style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#9b9bb0; width:10%;">ou</td>
                    <td style="border-top:1px solid #e5e3f5; width:45%;">&nbsp;</td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Texto do link -->
            <tr>
              <td class="fluid-padding" style="padding:0 50px 16px 50px; font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#2c2c40; line-height:22px;">
                Se o botão não funcionar, copie e cole o link abaixo no seu navegador:
              </td>
            </tr>

            <!-- Caixa do link -->
            <tr>
              <td class="fluid-padding" style="padding:0 50px 24px 50px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f5fd; border:1px solid #e5e3f5; border-radius:12px;">
                  <tr>
                    <td style="padding:16px 20px; font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#5b4bf5; word-break:break-all;">
                      &#128279; <a href="${url}" style="color:#5b4bf5; text-decoration:none;">${url}</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Aviso de segurança -->
            <tr>
              <td class="fluid-padding" style="padding:0 50px 40px 50px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f5fd; border-radius:12px;">
                  <tr>
                    <td width="76" valign="top" align="center" style="padding:20px 0 20px 20px;">
                      <table role="presentation" cellpadding="0" cellspacing="0">
                        <tr>
                          <td width="44" height="44" align="center" valign="middle" style="background-color:#5b4bf5; border-radius:22px; font-size:18px; color:#ffffff;">&#128737;</td>
                        </tr>
                      </table>
                    </td>
                    <td valign="top" style="padding:20px 20px 20px 12px; font-family:Arial, Helvetica, sans-serif;">
                      <p style="margin:0 0 6px 0; font-size:15px; font-weight:bold; color:#14142b;">Não solicitou esta alteração?</p>
                      <p style="margin:0; font-size:13px; line-height:20px; color:#6b6b80;">Se você não solicitou a redefinição de senha, ignore este e-mail. Sua senha permanecerá inalterada.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Rodapé do card -->
            <tr>
              <td class="fluid-padding" style="padding:0 50px; border-top:1px solid #eeecf9;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
                  <tr>
                    <td style="padding:24px 0;">
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                        <tr class="stack-footer">
                          <td valign="middle" style="font-family:Arial, Helvetica, sans-serif;">
                            <table role="presentation" cellpadding="0" cellspacing="0">
                              <tr>
                                <td width="44" valign="middle">
                                  <table role="presentation" cellpadding="0" cellspacing="0">
                                    <tr><td width="40" height="40" align="center" valign="middle" style="background-color:#5b4bf5; border-radius:10px; color:#ffffff; font-size:12px; font-weight:bold;">&lt;/&gt;</td></tr>
                                  </table>
                                </td>
                                <td width="12">&nbsp;</td>
                                <td valign="middle">
                                  <p style="margin:0; font-size:14px; font-weight:bold; color:#14142b;">MadeCoders</p>
                                  <p style="margin:2px 0 0 0; font-size:12px; color:#8b8ba0;">Plataforma para desenvolvedores<br>construírem experiência em projetos reais.</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                          <td class="social-td" align="right" valign="middle">
                            <table role="presentation" cellpadding="0" cellspacing="0">
                              <tr>
                                <td width="34" height="34" align="center" valign="middle">
                                  <a href="https://www.linkedin.com/company/madecoders/" style="text-decoration:none;"><img src="data:image/png;base64,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" width="34" height="34" alt="LinkedIn" style="display:block; border-radius:8px; border:0;"></a>
                                </td>
                                <td width="8">&nbsp;</td>
                                <td width="34" height="34" align="center" valign="middle">
                                  <a href="https://discord.gg/WMgtWMzap" style="text-decoration:none;"><img src="data:image/png;base64,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" width="34" height="34" alt="Discord" style="display:block; border-radius:8px; border:0;"></a>
                                </td>
                                <td width="8">&nbsp;</td>
                                <td width="34" height="34" align="center" valign="middle">
                                  <a href="https://www.youtube.com/@madecoders" style="text-decoration:none;"><img src="data:image/png;base64,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" width="34" height="34" alt="YouTube" style="display:block; border-radius:8px; border:0;"></a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

          </table>
        </td>
      </tr>

      <!-- Rodapé externo -->
      <tr>
        <td align="center" style="padding:24px 20px 40px 20px; font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#9b9bb0; line-height:20px;">
          © 2026 MadeCoders. Todos os direitos reservados.<br>
          <a href="https://madecoders.com/privacy" style="color:#5b4bf5; text-decoration:none;">Política de Privacidade</a> &nbsp;•&nbsp;
          <a href="https://madecoders.com/terms" style="color:#5b4bf5; text-decoration:none;">Termos de Uso</a> &nbsp;•&nbsp;
          <a href="https://madecoders.com/support" style="color:#5b4bf5; text-decoration:none;">Suporte</a>
        </td>
      </tr>

    </table>
  </div>
  </center>
</body>
</html>

`;
