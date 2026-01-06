import React from 'react';

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 125"
      className={className}
      fill="none"
    >
      <path
        d="M50 2.5C23.5 2.5 2.5 20.8 2.5 50V90C2.5 95.2 6.8 99.5 12 99.5H88C93.2 99.5 97.5 95.2 97.5 90V50C97.5 20.8 76.5 2.5 50 2.5Z"
        stroke="#E6B34A"
        strokeWidth="3"
      />
      <path
        d="M97.5 50H2.5V90C2.5 95.2467 6.75329 99.5 12 99.5H88C93.2467 99.5 97.5 95.2467 97.5 90V50Z"
        fill="#0000FF"
      />
      <path
        d="M2.5 50H97.5V20C97.5 10.335 89.665 2.5 80 2.5H20C10.335 2.5 2.5 10.335 2.5 20V50Z"
        fill="#FF0000"
      />
      <circle cx="50" cy="50" r="30" stroke="#E6B34A" strokeWidth="3" />

      <path
        d="M68 55C68 60.5228 63.5228 65 58 65C52.4772 65 48 60.5228 48 55"
        stroke="#E6B34A"
        strokeWidth="2"
      />
      <path
        d="M48 55V65L44 70"
        stroke="#E6B34A"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M40 73L38 68"
        stroke="#E6B34A"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M60 40C61.1046 40 62 39.1046 62 38C62 36.8954 61.1046 36 60 36C58.8954 36 58 36.8954 58 38C58 39.1046 58.8954 40 60 40Z"
        fill="#E6B34A"
      />
      <path
        d="M58 45C58 43.8954 57.1046 43 56 43C54.8954 43 54 43.8954 54 45"
        stroke="#E6B34A"
        strokeWidth="2"
      />
      <path
        d="M42 42C43.1046 42 44 41.1046 44 40C44 38.8954 43.1046 38 42 38"
        stroke="#E6B34A"
        strokeWidth="2"
      />
      <path
        d="M48 48C48 46.8954 47.1046 46 46 46C44.8954 46 44 46.8954 44 48"
        stroke="#E6B34A"
        strokeWidth="2"
      />
      <circle cx="38" cy="46" r="1.5" stroke="#E6B34A" />
      <circle cx="42" cy="50" r="1.5" stroke="#E6B34A" />
      <circle cx="46" cy="52" r="1.5" stroke="#E6B34A" />
      <circle cx="50" cy="52" r="1.5" stroke="#E6B34A" />
      <circle cx="54" cy="50" r="1.5" stroke="#E6B34A" />
      <circle cx="58" cy="48" r="1.5" stroke="#E6B34A" />
    </svg>
  );
}