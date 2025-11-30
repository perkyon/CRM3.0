alter table public.production_items
  add column if not exists materials text,
  add column if not exists technical_notes text,
  add column if not exists manager_comment text,
  add column if not exists due_date date;

comment on column public.production_items.materials is 'Менеджерские заметки по материалам';
comment on column public.production_items.technical_notes is 'Ссылки и заметки по технике исполнения';
comment on column public.production_items.manager_comment is 'Комментарий менеджера по изделию';
comment on column public.production_items.due_date is 'Дедлайн изготовления изделия';

