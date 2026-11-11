reate table alunos(
  id int auto_increment primary key,
  nome varchar (255)
  altura decimal,
  senha varchar (32)
  );

  insert into alunos(nome,altura,senha) 
  values("luís carlos",1.80, " aluno@#");

  select*
  from alunos
  where nome= "luís carlos";