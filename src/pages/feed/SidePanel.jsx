import React from "react";

export const SidePanel = ({ user }) => {
  if (!user) return null;

  const skills = user.profile?.skills ?? [];

  return (
    <div className="space-y-4">
      {/* Technical Stack card */}
      <div className="card p-5">
        <p className="mb-4 text-[10px] font-semibold tracking-[0.18em] text-ink/30 uppercase">
          Technical Stack
        </p>
        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 8).map((skill) => (
              <span key={skill} className="tag capitalize">
                {skill}
              </span>
            ))}
            {skills.length > 8 && (
              <span className="tag text-ink-faint">
                +{skills.length - 8} more
              </span>
            )}
          </div>
        ) : (
          <p className="text-sm text-ink-faint italic">No skills listed</p>
        )}
      </div>

      {/* Decorative */}
      <div className="flex items-center justify-end pr-2">
        <div className="h-14 w-14 rounded-full bg-green-400/80" />
      </div>
    </div>
  );
};
