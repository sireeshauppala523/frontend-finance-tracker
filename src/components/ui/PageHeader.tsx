type Props = {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel?: string;
};

export function PageHeader({ eyebrow, title, description, actionLabel }: Props) {
  return (
    <div className="page-header">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actionLabel ? <button className="primary-button">{actionLabel}</button> : null}
    </div>
  );
}