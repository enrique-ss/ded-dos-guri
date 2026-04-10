/**
 * D&D dos Guri – Banco de Dados do Sistema
 * Contém raças, classes, perícias, antecedentes e condições.
 */

const RACES = {
    humano: { name: 'Humano', modsDesc: '+1 em 3 atributos à escolha', feature: 'Aprendiz Rápido: Ganha 1 Talento (Feat) no nível 1.', speed: 9 },
    elfo: { name: 'Elfo', modsDesc: '+2 Destreza, +1 Inteligência', feature: 'Sentido Aguçado: Visão no escuro e imunidade a sono mágico.', speed: 9 },
    anao: { name: 'Anão', modsDesc: '+2 Constituição, +1 Força', feature: 'Resiliência: Resistência a veneno e +1 PV por nível.', speed: 7.5 },
    halfling: { name: 'Halfling', modsDesc: '+2 Destreza, +1 Carisma', feature: 'Sorte: Pode relançar qualquer resultado "1" no dado.', speed: 7.5 },
    meio_elfo: { name: 'Meio-Elfo', modsDesc: '+2 Carisma, +1 em outros 2', feature: 'Versatilidade: Proficiência em 2 perícias extras.', speed: 9 },
    meio_orc: { name: 'Meio-Orc', modsDesc: '+2 Força, +1 Constituição', feature: 'Tenacidade: Se cair a 1 HP, consegue se levantar e dar um ultimo ataque antes de desmaiar.', speed: 9 },
    tiefling: { name: 'Tiefling', modsDesc: '+2 Carisma, +1 Inteligência', feature: 'Legado: Resistência a fogo e 1 Truque mágico (Cantrip).', speed: 9 },
    gnomo: { name: 'Gnomo', modsDesc: '+2 Inteligência, +1 Const.', feature: 'Mente Astuta: Vantagem em salvaguardas mentais contra magia.', speed: 7.5 }
};

const CLASSES = {
    guerreiro: { name: 'Guerreiro', icon: '⚔️', hp: 10, saves: ['for', 'con'], hd: '1d10', armor: 'Todas as armaduras, escudos, armas simples e marciais.', skillsDesc: 'Escolha 2: Acrobacia, Adestrar Animais, Atletismo, História, Intuição, Intimidação, Percepção e Sobrevivência.', skillChoices: 2, allowSkills: ['acrobatics', 'animal', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'] },
    ladino: { name: 'Ladino', icon: '🗡️', hp: 8, saves: ['des', 'int'], hd: '1d8', armor: 'Armaduras leves, armas simples, bestas de mão, espadas curtas, rapieiras e espadas longas.', skillsDesc: 'Escolha 4: Acrobacia, Atletismo, Atuação, Enganação, Furtividade, Intimidação... +Ferramentas de Ladrão.', skillChoices: 4, allowSkills: ['acrobatics', 'athletics', 'performance', 'deception', 'stealth', 'intimidation', 'insight', 'investigation', 'perception', 'persuasion', 'sleight'] },
    mago: { name: 'Mago', icon: '🪄', hp: 6, saves: ['int', 'sab'], hd: '1d6', armor: 'Adagas, dardos, fundas, bordões e bestas leves. (Nenhuma armadura).', skillsDesc: 'Escolha 2: Arcanismo, História, Investigação, Medicina e Religião.', skillChoices: 2, allowSkills: ['arcana', 'history', 'investigation', 'medicine', 'religion'] },
    clerigo: { name: 'Clérigo', icon: '✨', hp: 8, saves: ['sab', 'car'], hd: '1d8', armor: 'Armaduras leves e médias, escudos e armas simples.', skillsDesc: 'Escolha 2: História, Intuição, Medicina, Persuasão e Religião.', skillChoices: 2, allowSkills: ['history', 'insight', 'medicine', 'persuasion', 'religion'] },
    paladino: { name: 'Paladino', icon: '🛡️', hp: 10, saves: ['sab', 'car'], hd: '1d10', armor: 'Todas as armaduras, escudos, armas simples e marciais.', skillsDesc: 'Escolha 2: Atletismo, Intuição, Intimidação, Medicina, Persuasão e Religião.', skillChoices: 2, allowSkills: ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion'] },
    barbaro: { name: 'Bárbaro', icon: '🪓', hp: 12, saves: ['for', 'con'], hd: '1d12', armor: 'Armaduras leves e médias, escudos, armas simples e marciais.', skillsDesc: 'Escolha 2: Adestrar Animais, Atletismo, Intimidação, Natureza, Percepção e Sobrevivência.', skillChoices: 2, allowSkills: ['animal', 'athletics', 'intimidation', 'nature', 'perception', 'survival'] },
    bardo: { name: 'Bardo', icon: '🪕', hp: 8, saves: ['des', 'car'], hd: '1d8', armor: 'Armaduras leves, armas simples, bestas, espadas. +3 Instrumentos.', skillsDesc: 'Escolha 3 quaisquer (O Bardo é o "pau para toda obra").', skillChoices: 3, allowSkills: 'all' },
    patrulheiro: { name: 'Patrulheiro', icon: '🏹', hp: 10, saves: ['for', 'des'], hd: '1d10', armor: 'Armaduras leves e médias, escudos, armas simples e marciais.', skillsDesc: 'Escolha 3: Adestrar Animais, Atletismo, Intuição, Investigação, Natureza... Furtividade.', skillChoices: 3, allowSkills: ['animal', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'survival', 'stealth'] },
    feiticeiro: { name: 'Feiticeiro', icon: '🔮', hp: 6, saves: ['con', 'car'], hd: '1d6', armor: 'Adagas, dardos, fundas, bordões e bestas leves.', skillsDesc: 'Escolha 2: Arcanismo, Enganação, Intuição, Intimidação, Persuasão e Religião.', skillChoices: 2, allowSkills: ['arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion'] },
    bruxo: { name: 'Bruxo', icon: '💀', hp: 8, saves: ['sab', 'car'], hd: '1d8', armor: 'Armaduras leves e armas simples.', skillsDesc: 'Escolha 2: Arcanismo, Enganação, História, Intimidação, Investigação, Natureza e Religião.', skillChoices: 2, allowSkills: ['arcana', 'deception', 'history', 'intimidation', 'investigation', 'nature', 'religion'] },
    druida: { name: 'Druida', icon: '🌿', hp: 8, saves: ['int', 'sab'], hd: '1d8', armor: 'Armaduras leves e médias (não usam metal!), escudos, clavas, lanças...', skillsDesc: 'Escolha 2: Adestrar Animais, Arcanismo, Intuição, Medicina, Natureza, Percepção, Religião e Sobrevivência.', skillChoices: 2, allowSkills: ['animal', 'arcana', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival'] }
};

const BACKGROUNDS = {
    acolito: { name: 'Acólito', desc: 'Você serviu em um templo e possui conhecimentos religiosos e rituais.' },
    charlatao: { name: 'Charlatão', desc: 'Um mestre da manipulação e truques, viveu de enganar os outros.' },
    criminoso: { name: 'Criminoso', desc: 'Você tem contatos no submundo e experiência em atividades ilegais.' },
    animador: { name: 'Animador', desc: 'Ator, músico ou gladiador; você sabe como entreter uma plateia.' },
    heroi: { name: 'Herói do Povo', desc: 'Você veio de uma origem humilde e se tornou um defensor dos plebeus.' },
    artesao: { name: 'Artesão de Guilda', desc: 'Membro de uma guilda mercantil, perito em um ofício específico.' },
    eremita: { name: 'Eremita', desc: 'Você viveu em isolamento e descobriu um segredo ou iluminação.' },
    nobre: { name: 'Nobre', desc: 'Você nasceu em uma família influente e possui privilégios sociais.' },
    forasteiro: { name: 'Forasteiro', desc: 'Um sobrevivente das terras selvagens, acostumado a ambientes rudes.' },
    sabio: { name: 'Sábio', desc: 'Um estudioso dedicado à busca pelo conhecimento acadêmico.' },
    marinheiro: { name: 'Marinheiro', desc: 'Um lobo do mar, experiente em navios e navegação.' },
    soldado: { name: 'Soldado', desc: 'Você foi treinado para a guerra e serviu em um exército ou guarda.' },
    orfao: { name: 'Órfão', desc: 'Você cresceu nas ruas, sobrevivendo apenas com sua esperteza.' }
};

const ALIGNMENTS = {
    lb: { name: 'Leal/Bom', desc: 'Age com honra, compaixão e segue a lei.' },
    nb: { name: 'Neutro/Bom', desc: 'Faz o melhor que pode para ajudar os outros.' },
    cb: { name: 'Caótico/Bom', desc: 'Age conforme sua consciência, independente das leis.' },
    ln: { name: 'Leal/Neutro', desc: 'Age conforme a lei, tradição ou código pessoal.' },
    nn: { name: 'Neutro', desc: 'Afastado de dilemas morais; age com pragmatismo.' },
    cn: { name: 'Caótico/Neutro', desc: 'Segue seus caprichos; preza a liberdade individual.' },
    lm: { name: 'Leal/Mau', desc: 'Toma o que quer dentro dos limites de um código ou lei.' },
    nm: { name: 'Neutro/Mau', desc: 'Faz qualquer coisa para conseguir o que quer, sem escrúpulos.' },
    cm: { name: 'Caótico/Mau', desc: 'Age com violência impulsiva e sede de poder.' }
};

const SKILLS = [
    { id: 'acrobatics', name: 'Acrobacia', attr: 'des' },
    { id: 'athletics', name: 'Atletismo', attr: 'for' },
    { id: 'arcana', name: 'Arcanismo', attr: 'int' },
    { id: 'deception', name: 'Enganação', attr: 'car' },
    { id: 'stealth', name: 'Furtividade', attr: 'des' },
    { id: 'history', name: 'História', attr: 'int' },
    { id: 'intimidation', name: 'Intimidação', attr: 'car' },
    { id: 'insight', name: 'Intuição', attr: 'sab' },
    { id: 'investigation', name: 'Investigação', attr: 'int' },
    { id: 'medicine', name: 'Medicina', attr: 'sab' },
    { id: 'nature', name: 'Natureza', attr: 'int' },
    { id: 'perception', name: 'Percepção', attr: 'sab' },
    { id: 'persuasion', name: 'Persuasão', attr: 'car' },
    { id: 'sleight', name: 'Prestidigitação', attr: 'des' },
    { id: 'religion', name: 'Religião', attr: 'int' },
    { id: 'survival', name: 'Sobrevivência', attr: 'sab' },
    { id: 'animal', name: 'Adestrar Animais', attr: 'sab' },
    { id: 'performance', name: 'Atuação', attr: 'car' }
];

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

const CONDITIONS = {
    blinded: { name: 'Cego', icon: '👁️', color: '#7f8c8d' },
    charmed: { name: 'Enfeitiçado', icon: '💖', color: '#e84393' },
    deafened: { name: 'Surdo', icon: '🔇', color: '#95a5a6' },
    frightened: { name: 'Amedrontado', icon: '😨', color: '#6c5ce7' },
    grappled: { name: 'Agarrado', icon: '🤝', color: '#d63031' },
    incapacitated: { name: 'Incapacitado', icon: '🤕', color: '#fab1a0' },
    invisible: { name: 'Invisível', icon: '👻', color: '#81ecec' },
    paralyzed: { name: 'Paralisado', icon: '⚡', color: '#fdcb6e' },
    petrified: { name: 'Petrificado', icon: '🗿', color: '#2d3436' },
    poisoned: { name: 'Envenenado', icon: '🤢', color: '#27ae60' },
    prone: { name: 'Caído', icon: '🛌', color: '#e67e22' },
    restrained: { name: 'Imobilizado', icon: '⛓️', color: '#e17055' },
    stunned: { name: 'Atordoado', icon: '💫', color: '#f1c40f' },
    unconscious: { name: 'Inconsciente', icon: '💤', color: '#2980b9' },
    exhausted: { name: 'Exausto', icon: '🥱', color: '#d35400' },
    on_fire: { name: 'Em Chamas', icon: '🔥', color: '#e74c3c' },
    frozen: { name: 'Congelado', icon: '❄️', color: '#3498db' },
    cursed: { name: 'Amaldiçoado', icon: '🧿', color: '#8e44ad' },
    blessed: { name: 'Abençoado', icon: '✨', color: '#f1c40f' }
};
