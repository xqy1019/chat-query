// const rewrites = () => {
//     return [
//         {
//             source: '/openai/:path*',
//             destination: 'https://chat-query-backend.netlify.app/api/openai/:path*',
//         },
//         ,
//     ];
// };

const rewrites = async () => {
    const ret = [
        {
            source: '/openai/:path*',
            destination: `${process.env.OPENAI_PROXY_URL || 'https://api.openai.com'}/:path*`,
        },
        {
            source: '/google-fonts/:path*',
            destination: 'https://fonts.googleapis.com/:path*',
        },
        {
            source: '/sharegpt',
            destination: 'https://sharegpt.com/api/conversations',
        },
        {
            source: '/backend/:path*',
            // destination: 'https://chat-query-backend.onrender.com/:path*',
            destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/:path*`,
            // destination: 'http://139.198.179.193:30981/:path*',
        },
    ];

    return {
        beforeFiles: ret,
    };
};

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    publicRuntimeConfig: {
        apiPath: '/api/',
        backendOrigin: process.env.NEXT_PUBLIC_BACKEND_URL,
    },
    rewrites,
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;
