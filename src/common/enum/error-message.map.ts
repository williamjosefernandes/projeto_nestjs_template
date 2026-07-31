import { ErrorCode } from './error-code.enum';

/**
 * Fonte única da mensagem (descrição, em PT-BR) de cada `ErrorCode`
 * (título). Nenhum ponto do código deve escrever a mensagem "na mão" —
 * sempre lance uma `AppException` com o código e a mensagem é resolvida
 * aqui. Isso evita divergência de texto entre lugares que lançam o mesmo
 * erro e é o ponto único a traduzir quando a API passar a suportar outros
 * idiomas.
 */
export const ErrorMessage: Record<ErrorCode, string> = {
  // Genéricos / infraestrutura
  [ErrorCode.INTERNAL_SERVER_ERROR]: 'Erro interno do servidor.',
  [ErrorCode.VALIDATION_ERROR]: 'A requisição contém erros de validação.',
  [ErrorCode.BAD_REQUEST]: 'Requisição inválida.',
  [ErrorCode.NOT_FOUND]: 'Recurso não encontrado.',
  [ErrorCode.CONFLICT]: 'Conflito ao processar a requisição.',
  [ErrorCode.EMAIL_DELIVERY_FAILED]: 'Não foi possível enviar o e-mail.',

  // Autenticação / credenciais
  [ErrorCode.INVALID_CREDENTIALS]: 'Credenciais inválidas.',
  [ErrorCode.UNVERIFIED_EMAIL]: 'E-mail não verificado.',
  [ErrorCode.ACCOUNT_INACTIVE]: 'Conta inativa, suspensa ou bloqueada.',
  [ErrorCode.PASSWORD_NOT_PROVIDED]: 'Senha não informada.',
  [ErrorCode.FIREBASE_TOKEN_NOT_PROVIDED]: 'Token do Firebase não fornecido.',
  [ErrorCode.INVALID_FIREBASE_TOKEN]: 'Token do Firebase inválido.',
  [ErrorCode.UNAUTHENTICATED]: 'Usuário não autenticado.',
  [ErrorCode.EMAIL_ALREADY_IN_USE]: 'Este e-mail já está em uso.',

  // Tokens / sessão
  [ErrorCode.INVALID_TOKEN]: 'Token inválido ou malformado.',
  [ErrorCode.TOKEN_EXPIRED]: 'Token expirado.',
  [ErrorCode.INVALID_REFRESH_TOKEN]: 'Refresh token inválido.',
  [ErrorCode.REFRESH_TOKEN_EXPIRED]: 'Refresh token expirado.',
  [ErrorCode.SESSION_NOT_FOUND]: 'Sessão não encontrada.',
  [ErrorCode.SESSION_EXPIRED]: 'Sessão expirada.',
  [ErrorCode.SESSION_REVOKED]: 'Sessão revogada.',

  // Autorização
  [ErrorCode.PERMISSION_DENIED]: 'Permissão negada.',
  [ErrorCode.MEMBERSHIP_INVALID]: 'Usuário não possui acesso a esta conta.',
  [ErrorCode.PROFILE_INVALID]: 'Perfil inválido para acessar este recurso.',
  [ErrorCode.ACCOUNT_ACCESS_DENIED]: 'Acesso negado para esta conta.',
  [ErrorCode.USER_BLOCKED]: 'Usuário bloqueado.',

  // Usuários / contas
  [ErrorCode.USER_NOT_FOUND]: 'Usuário não encontrado.',
  [ErrorCode.USER_NOT_FOUND_IN_ACCOUNT]: 'Usuário não encontrado nesta conta.',
  [ErrorCode.USER_NOT_MEMBER_OF_ACCOUNT]: 'Usuário não é membro desta conta.',
  [ErrorCode.USER_ALREADY_IN_ACCOUNT]: 'Usuário já pertence a esta conta.',
  [ErrorCode.INVALID_CURRENT_PASSWORD]: 'Senha atual inválida.',
  [ErrorCode.CANNOT_DELETE_OWNER]: 'Não é possível remover o proprietário da conta.',
  [ErrorCode.CANNOT_BLOCK_OWNER]: 'Não é possível bloquear o proprietário da conta.',

  // Verificação de e-mail / redefinição de senha
  [ErrorCode.INVALID_VERIFICATION_CODE]: 'Código de verificação inválido.',
  [ErrorCode.VERIFICATION_CODE_EXPIRED]: 'Código de verificação expirado.',
  [ErrorCode.INVALID_RESET_TOKEN]: 'Token de redefinição de senha inválido.',
  [ErrorCode.RESET_TOKEN_EXPIRED]: 'Token de redefinição de senha expirado.',

  // FAQ
  [ErrorCode.FAQ_NOT_FOUND]: 'FAQ não encontrada.',
};
